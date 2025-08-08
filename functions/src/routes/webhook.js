const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { executeFlow } = require('../flows/flowExecutor');

function metaVerify(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!expected) {
    return res.status(500).send('META_WEBHOOK_VERIFY_TOKEN não configurado');
  }
  if (mode === 'subscribe' && token === expected) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

async function metaReceive(req, res) {
  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const messages = change?.messages || [];
    const db = getFirestore();
    const defaultBotId = 'default-bot';

    for (const m of messages) {
      const wa_id = m.from;
      const text = m.text?.body || '';
      await db.collection('conversations').doc(wa_id).set({ status: 'active', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      await db.collection('conversations').doc(wa_id).collection('messages').add({ direction: 'incoming', type: 'text', text, meta: m, timestamp: FieldValue.serverTimestamp() });

      const bot = await db.collection('chatbots').doc(defaultBotId).get();
      const activeVersion = bot.data()?.activeFlowVersion;
      if (!activeVersion) continue;
      const fv = await db.collection('chatbots').doc(defaultBotId).collection('flowVersions').doc(activeVersion).get();
      const flowMap = fv.data()?.flowMap;
      if (!flowMap) continue;

      const onYield = async (payload) => {
        if (payload.type === 'DELAY') {
          await db.collection('paused_flows').add({
            botId: defaultBotId, wa_id, flowVersionId: activeVersion,
            nodeId: payload.nodeId, context: payload.context,
            resumeAt: new Date(payload.resumeAt), createdAt: FieldValue.serverTimestamp(),
          });
        }
      };

      await executeFlow({ flowMap, event: { type: 'newMessage', wa_id, text }, context: { contact: { wa_id }, vars: {}, meta: {} }, onYield });
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

module.exports = { metaVerify, metaReceive };




const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { executeFlow } = require('../flows/flowExecutor');

async function cronHandler(req, res) {
  try {
    const db = getFirestore();
    const now = Timestamp.now();
    const snap = await db.collection('paused_flows').where('resumeAt', '<=', now).limit(50).get();

    for (const doc of snap.docs) {
      const pf = doc.data();
      const bot = await db.collection('chatbots').doc(pf.botId).get();
      const activeVersion = bot.data()?.activeFlowVersion;
      if (!activeVersion) { await doc.ref.delete(); continue; }
      const fv = await db.collection('chatbots').doc(pf.botId).collection('flowVersions').doc(activeVersion).get();
      const flowMap = fv.data()?.flowMap;
      if (!flowMap) { await doc.ref.delete(); continue; }

      const onYield = async (payload) => {
        if (payload.type === 'DELAY') {
          await db.collection('paused_flows').add({
            botId: pf.botId,
            wa_id: pf.wa_id,
            flowVersionId: activeVersion,
            nodeId: payload.nodeId,
            context: payload.context,
            resumeAt: Timestamp.fromMillis(payload.resumeAt),
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      };

      await executeFlow({
        flowMap,
        event: { type: 'resume', wa_id: pf.wa_id },
        context: pf.context,
        onYield,
      });

      await doc.ref.delete();
    }

    res.json({ ok: true, resumed: snap.size });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

module.exports = { cronHandler };






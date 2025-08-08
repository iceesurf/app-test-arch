const { getFirestore, FieldValue } = require('firebase-admin/firestore');

async function sendMessageHandler(req, res) {
  try {
    const { wa_id, text } = req.body;
    if (!wa_id || !text) return res.status(400).json({ ok: false, error: 'wa_id e text obrigatórios' });

    const db = getFirestore();
    // TODO: Integração real com Graph API da Meta
    await db.collection('conversations').doc(wa_id).set({ status: 'active', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await db.collection('conversations').doc(wa_id).collection('messages').add({
      direction: 'outgoing', type: 'text', text, timestamp: FieldValue.serverTimestamp(),
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

module.exports = { sendMessageHandler };




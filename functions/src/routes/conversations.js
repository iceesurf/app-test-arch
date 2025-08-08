const {getFirestore, FieldValue} = require("firebase-admin/firestore");

/**
 * Envia mensagem via WhatsApp usando Meta Graph API
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function sendMessageHandler(req, res) {
  try {
    const {wa_id, text} = req.body;
    if (!wa_id || !text) {
      return res.status(400).json({ok: false, error: "wa_id e text obrigatórios"});
    }

    const db = getFirestore();

    // Verificar se temos as credenciais do Meta
    const metaToken = process.env.META_WHATSAPP_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

    if (!metaToken || !phoneNumberId) {
      console.warn("Meta WhatsApp credentials não configuradas, salvando apenas no Firestore");
      await db.collection("conversations").doc(wa_id).set({
        status: "active",
        updatedAt: FieldValue.serverTimestamp(),
      }, {merge: true});
      await db.collection("conversations").doc(wa_id).collection("messages").add({
        direction: "outgoing",
        type: "text",
        text,
        timestamp: FieldValue.serverTimestamp(),
      });
      return res.json({ok: true, message: "Salvo no Firestore (Meta não configurado)"});
    }

    // Enviar via Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${metaToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: wa_id,
        type: "text",
        text: {body: text},
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Erro ao enviar via Meta API:", result);
      return res.status(500).json({
        ok: false,
        error: "Erro ao enviar mensagem via WhatsApp",
        details: result,
      });
    }

    // Salvar no Firestore
    await db.collection("conversations").doc(wa_id).set({
      status: "active",
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    await db.collection("conversations").doc(wa_id).collection("messages").add({
      direction: "outgoing",
      type: "text",
      text,
      timestamp: FieldValue.serverTimestamp(),
      meta_message_id: result.messages && result.messages[0] ? result.messages[0].id : null,
    });

    res.json({
      ok: true,
      message_id: result.messages && result.messages[0] ? result.messages[0].id : null,
    });
  } catch (e) {
    console.error("Erro no sendMessageHandler:", e);
    res.status(500).json({ok: false, error: e.message});
  }
}

module.exports = {sendMessageHandler};






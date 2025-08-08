const {getFirestore, FieldValue} = require("firebase-admin/firestore");

/**
 * Envia mensagem via WhatsApp usando credenciais do tenant
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
    const tenantId = req.tenantId;

    // Buscar credenciais do tenant
    const tenantDoc = await db
        .collection("tenants")
        .doc(tenantId)
        .collection("settings")
        .doc("integrations")
        .get();

    if (!tenantDoc.exists) {
      return res.status(404).json({ok: false, error: "Configurações do tenant não encontradas"});
    }

    const tenantData = tenantDoc.data();
    const whatsappConfig = tenantData.whatsapp;

    if (!whatsappConfig || !whatsappConfig.access_token || !whatsappConfig.phone_number_id) {
      console.warn(`WhatsApp não configurado para tenant ${tenantId}, salvando apenas no Firestore`);
      await db.collection("conversations").doc(wa_id).set({
        status: "active",
        tenantId: tenantId,
        updatedAt: FieldValue.serverTimestamp(),
      }, {merge: true});
      await db.collection("conversations").doc(wa_id).collection("messages").add({
        direction: "outgoing",
        type: "text",
        text,
        timestamp: FieldValue.serverTimestamp(),
        tenantId: tenantId,
      });
      return res.json({ok: true, message: "Salvo no Firestore (WhatsApp não configurado)"});
    }

    // Enviar via Meta Graph API usando credenciais do tenant
    const response = await fetch(`https://graph.facebook.com/v20.0/${whatsappConfig.phone_number_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappConfig.access_token}`,
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
      tenantId: tenantId,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    await db.collection("conversations").doc(wa_id).collection("messages").add({
      direction: "outgoing",
      type: "text",
      text,
      timestamp: FieldValue.serverTimestamp(),
      meta_message_id: result.messages && result.messages[0] ? result.messages[0].id : null,
      tenantId: tenantId,
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



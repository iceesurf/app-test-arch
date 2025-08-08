const {getFirestore, FieldValue} = require("firebase-admin/firestore");

/**
 * Verificação do webhook Meta WhatsApp
 */
async function metaVerify(req, res) {
  try {
    const {tenant} = req.query;
    const {hub_mode, hub_verify_token, hub_challenge} = req.query;
    
    if (!tenant) {
      return res.status(400).json({error: "Parâmetro tenant obrigatório"});
    }
    
    // Buscar verify_token do tenant
    const db = getFirestore();
    const tenantDoc = await db
        .collection("tenants")
        .doc(tenant)
        .collection("settings")
        .doc("integrations")
        .get();
    
    if (!tenantDoc.exists) {
      return res.status(404).json({error: "Tenant não encontrado"});
    }
    
    const tenantData = tenantDoc.data();
    const verifyToken = tenantData.whatsapp?.verify_token;
    
    if (hub_mode === "subscribe" && hub_verify_token === verifyToken) {
      console.log("Webhook verificado para tenant:", tenant);
      res.status(200).send(hub_challenge);
    } else {
      console.log("Falha na verificação do webhook para tenant:", tenant);
      res.status(403).send("Forbidden");
    }
  } catch (error) {
    console.error("Erro na verificação do webhook:", error);
    res.status(500).json({error: error.message});
  }
}

/**
 * Recebimento de mensagens do Meta WhatsApp
 */
async function metaReceive(req, res) {
  try {
    const {tenant} = req.query;
    if (!tenant) {
      return res.status(400).json({error: "Parâmetro tenant obrigatório"});
    }
    
    const {object, entry} = req.body;
    
    if (object !== "whatsapp_business_account") {
      return res.status(200).send("OK");
    }
    
    const db = getFirestore();
    
    for (const entryItem of entry) {
      for (const change of entryItem.changes) {
        if (change.value.messages && change.value.messages.length > 0) {
          for (const message of change.value.messages) {
            const wa_id = message.from;
            const text = message.text?.body || "";
            const timestamp = message.timestamp;
            
            // Salvar mensagem recebida
            await db.collection("conversations").doc(wa_id).set({
              status: "active",
              tenantId: tenant,
              updatedAt: FieldValue.serverTimestamp(),
            }, {merge: true});
            
            await db.collection("conversations").doc(wa_id).collection("messages").add({
              direction: "incoming",
              type: "text",
              text,
              timestamp: new Date(timestamp * 1000),
              meta_message_id: message.id,
              tenantId: tenant,
            });
            
            console.log(`Mensagem recebida de ${wa_id}: ${text}`);
          }
        }
      }
    }
    
    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no webhook Meta:", error);
    res.status(500).json({error: error.message});
  }
}

module.exports = {metaVerify, metaReceive};




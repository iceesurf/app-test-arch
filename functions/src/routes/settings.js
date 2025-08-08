const {getFirestore, FieldValue} = require("firebase-admin/firestore");

function getTenantId(req) {
  // Usar tenantId do middleware de autenticação
  return req.tenantId || "default-tenant";
}

async function getBranding(req, res) {
  try {
    const tenantId = getTenantId(req);
    const doc = await getFirestore()
        .collection("tenants")
        .doc(tenantId)
        .collection("settings")
        .doc("branding")
        .get();
    res.json(doc.exists ? doc.data() : {});
  } catch (e) {
    res.status(500).json({error: e.message});
  }
}

async function putBranding(req, res) {
  try {
    const tenantId = getTenantId(req);
    const data = req.body || {};
    await getFirestore()
        .collection("tenants")
        .doc(tenantId)
        .collection("settings")
        .doc("branding")
        .set({
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
        }, {merge: true});
    res.json({ok: true});
  } catch (e) {
    res.status(500).json({error: e.message});
  }
}

async function getIntegrations(req, res) {
  try {
    const tenantId = getTenantId(req);
    const doc = await getFirestore()
        .collection("tenants")
        .doc(tenantId)
        .collection("settings")
        .doc("integrations")
        .get();
    
    const data = doc.exists ? doc.data() : {};
    
    // Retornar dados sem expor tokens sensíveis
    res.json({
      whatsapp: {
        phone_number_id: data.whatsapp && data.whatsapp.phone_number_id ? data.whatsapp.phone_number_id : "",
        phone_number: data.whatsapp && data.whatsapp.phone_number ? data.whatsapp.phone_number : "",
        business_name: data.whatsapp && data.whatsapp.business_name ? data.whatsapp.business_name : "",
        is_configured: !!(data.whatsapp && data.whatsapp.access_token && data.whatsapp.phone_number_id),
      },
      smtp: {
        host: data.smtp && data.smtp.host ? data.smtp.host : "",
        port: data.smtp && data.smtp.port ? data.smtp.port : 587,
        user: data.smtp && data.smtp.user ? data.smtp.user : "",
        from: data.smtp && data.smtp.from ? data.smtp.from : "",
        is_configured: !!(data.smtp && data.smtp.host && data.smtp.user && data.smtp.pass),
      },
      webhook_url: `https://api.dnxtai.com/api/webhook/meta?tenant=${tenantId}`,
    });
  } catch (e) {
    res.status(500).json({error: e.message});
  }
}

async function putIntegrations(req, res) {
  try {
    const tenantId = getTenantId(req);
    const data = req.body || {};
    
    // Validar dados obrigatórios do WhatsApp
    if (data.whatsapp) {
      if (!data.whatsapp.access_token || !data.whatsapp.phone_number_id) {
        return res.status(400).json({
          error: "Dados obrigatórios do WhatsApp não fornecidos",
          required: ["access_token", "phone_number_id"],
        });
      }
    }
    
    // Validar dados obrigatórios do SMTP
    if (data.smtp) {
      if (!data.smtp.host || !data.smtp.user || !data.smtp.pass) {
        return res.status(400).json({
          error: "Dados obrigatórios do SMTP não fornecidos",
          required: ["host", "user", "pass"],
        });
      }
    }
    
    await getFirestore()
        .collection("tenants")
        .doc(tenantId)
        .collection("settings")
        .doc("integrations")
        .set({
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
        }, {merge: true});
    
    res.json({ok: true, message: "Integrações configuradas com sucesso"});
  } catch (e) {
    res.status(500).json({error: e.message});
  }
}

module.exports = {getBranding, putBranding, getIntegrations, putIntegrations};






const { getFirestore, FieldValue } = require('firebase-admin/firestore');

function getTenantId(req) {
  // Simplificado: usar uid se autenticado; em produção, derive do token/claims
  return req.user?.uid || 'default-tenant';
}

async function getBranding(req, res) {
  try {
    const tenantId = getTenantId(req);
    const doc = await getFirestore().collection('tenants').doc(tenantId).collection('settings').doc('branding').get();
    res.json(doc.exists ? doc.data() : {});
  } catch (e) { res.status(500).json({ error: e.message }); }
}

async function putBranding(req, res) {
  try {
    const tenantId = getTenantId(req);
    const data = req.body || {};
    await getFirestore().collection('tenants').doc(tenantId).collection('settings').doc('branding').set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

async function getIntegrations(req, res) {
  try {
    const tenantId = getTenantId(req);
    const doc = await getFirestore().collection('tenants').doc(tenantId).collection('settings').doc('integrations').get();
    res.json(doc.exists ? doc.data() : {});
  } catch (e) { res.status(500).json({ error: e.message }); }
}

async function putIntegrations(req, res) {
  try {
    const tenantId = getTenantId(req);
    const data = req.body || {};
    await getFirestore().collection('tenants').doc(tenantId).collection('settings').doc('integrations').set({ ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { getBranding, putBranding, getIntegrations, putIntegrations };




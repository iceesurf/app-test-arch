const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

function mapDoc(snapshot) {
  const data = snapshot.data() || {};
  return { id: snapshot.id, ...data };
}

async function getAllLeads(req, res) {
  try {
    const snapshot = await admin.firestore().collection("leads").orderBy("createdAt", "desc").get();
    const leads = snapshot.docs.map(mapDoc);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: "failed_to_fetch_leads", message: error.message });
  }
}

async function createLead(req, res) {
  try {
    const payload = req.body || {};
    const now = FieldValue.serverTimestamp();
    const docRef = await admin.firestore().collection("leads").add({
      name: payload.name || "",
      email: payload.email || "",
      phone: payload.phone || "",
      company: payload.company || "",
      status: payload.status || "new",
      source: payload.source || "manual",
      notes: payload.notes || "",
      createdAt: now,
      updatedAt: now,
    });
    const created = await docRef.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    res.status(500).json({ error: "failed_to_create_lead", message: error.message });
  }
}

async function updateLeadStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: "invalid_request", message: "id and status are required" });
    }
    const ref = admin.firestore().collection("leads").doc(id);
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    res.json(mapDoc(updated));
  } catch (error) {
    res.status(500).json({ error: "failed_to_update_lead_status", message: error.message });
  }
}

async function deleteLead(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "invalid_request", message: "id is required" });
    }
    await admin.firestore().collection("leads").doc(id).delete();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "failed_to_delete_lead", message: error.message });
  }
}

module.exports = {
  getAllLeads,
  createLead,
  updateLeadStatus,
  deleteLead,
};



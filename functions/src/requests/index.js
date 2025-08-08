const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

function mapDoc(snapshot) {
  const data = snapshot.data() || {};
  return { id: snapshot.id, ...data };
}

async function getAllRequests(req, res) {
  try {
    const snapshot = await admin.firestore().collection("requests").orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map(mapDoc));
  } catch (error) {
    res.status(500).json({ error: "failed_to_fetch_requests", message: error.message });
  }
}

async function createRequest(req, res) {
  try {
    const payload = req.body || {};
    const now = FieldValue.serverTimestamp();
    const ref = await admin.firestore().collection("requests").add({
      projectType: payload.projectType || "",
      projectName: payload.projectName || "",
      clientName: payload.clientName || "",
      clientEmail: payload.clientEmail || "",
      clientPhone: payload.clientPhone || "",
      description: payload.description || "",
      layout: payload.layout || "",
      budget: payload.budget || "",
      deadline: payload.deadline || "",
      status: payload.status || "pending",
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    res.status(500).json({ error: "failed_to_create_request", message: error.message });
  }
}

async function updateRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: "invalid_request", message: "id and status are required" });
    }
    const ref = admin.firestore().collection("requests").doc(id);
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    res.json(mapDoc(updated));
  } catch (error) {
    res.status(500).json({ error: "failed_to_update_request", message: error.message });
  }
}

async function deleteRequest(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "invalid_request", message: "id is required" });
    await admin.firestore().collection("requests").doc(id).delete();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "failed_to_delete_request", message: error.message });
  }
}

module.exports = {
  getAllRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest,
};



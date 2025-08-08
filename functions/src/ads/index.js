const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

function mapDoc(snapshot) {
  const data = snapshot.data() || {};
  return { id: snapshot.id, ...data };
}

async function getAllCampaigns(req, res) {
  try {
    const snapshot = await admin.firestore().collection("ads_campaigns").orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map(mapDoc));
  } catch (error) {
    res.status(500).json({ error: "failed_to_fetch_campaigns", message: error.message });
  }
}

async function createCampaign(req, res) {
  try {
    const payload = req.body || {};
    const now = FieldValue.serverTimestamp();
    const ref = await admin.firestore().collection("ads_campaigns").add({
      name: payload.name || "",
      platform: payload.platform || "facebook",
      budget: payload.budget || 0,
      status: payload.status || "draft",
      scheduleAt: payload.scheduleAt || null,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    res.status(500).json({ error: "failed_to_create_campaign", message: error.message });
  }
}

async function updateCampaignStatusApi(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: "invalid_request", message: "id and status are required" });
    }
    const ref = admin.firestore().collection("ads_campaigns").doc(id);
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    res.json(mapDoc(updated));
  } catch (error) {
    res.status(500).json({ error: "failed_to_update_campaign", message: error.message });
  }
}

async function deleteCampaign(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "invalid_request", message: "id is required" });
    }
    await admin.firestore().collection("ads_campaigns").doc(id).delete();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "failed_to_delete_campaign", message: error.message });
  }
}

module.exports = {
  getAllCampaigns,
  createCampaign,
  updateCampaignStatusApi,
  deleteCampaign,
};





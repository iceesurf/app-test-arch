const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

function mapDoc(snapshot) {
  const data = snapshot.data() || {};
  return { id: snapshot.id, ...data };
}

async function getAllEmailCampaigns(req, res) {
  try {
    const snapshot = await admin.firestore().collection("email_campaigns").orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map(mapDoc));
  } catch (error) {
    res.status(500).json({ error: "failed_to_fetch_email_campaigns", message: error.message });
  }
}

async function getAllEmailTemplates(req, res) {
  try {
    const snapshot = await admin.firestore().collection("email_templates").orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map(mapDoc));
  } catch (error) {
    res.status(500).json({ error: "failed_to_fetch_email_templates", message: error.message });
  }
}

async function createEmailCampaign(req, res) {
  try {
    const payload = req.body || {};
    const now = FieldValue.serverTimestamp();
    const ref = await admin.firestore().collection("email_campaigns").add({
      name: payload.name || "",
      subject: payload.subject || "",
      content: payload.content || "",
      status: payload.status || "draft",
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    res.status(500).json({ error: "failed_to_create_email_campaign", message: error.message });
  }
}

async function createEmailTemplate(req, res) {
  try {
    const payload = req.body || {};
    const now = FieldValue.serverTimestamp();
    const ref = await admin.firestore().collection("email_templates").add({
      name: payload.name || "",
      html: payload.html || "",
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    res.status(500).json({ error: "failed_to_create_email_template", message: error.message });
  }
}

async function sendEmailCampaign(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "invalid_request", message: "id is required" });
    }
    const ref = admin.firestore().collection("email_campaigns").doc(id);
    await ref.update({ status: "sent", updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    res.json(mapDoc(updated));
  } catch (error) {
    res.status(500).json({ error: "failed_to_send_email_campaign", message: error.message });
  }
}

async function deleteEmailCampaign(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "invalid_request", message: "id is required" });
    await admin.firestore().collection("email_campaigns").doc(id).delete();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "failed_to_delete_email_campaign", message: error.message });
  }
}

async function deleteEmailTemplate(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "invalid_request", message: "id is required" });
    await admin.firestore().collection("email_templates").doc(id).delete();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "failed_to_delete_email_template", message: error.message });
  }
}

module.exports = {
  getAllEmailCampaigns,
  getAllEmailTemplates,
  createEmailCampaign,
  createEmailTemplate,
  sendEmailCampaign,
  deleteEmailCampaign,
  deleteEmailTemplate,
};





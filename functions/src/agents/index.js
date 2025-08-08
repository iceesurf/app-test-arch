const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

function mapDoc(snapshot) {
  const data = snapshot.data() || {};
  return { id: snapshot.id, ...data };
}

async function getAllChatbots(req, res) {
  try {
    const snapshot = await admin.firestore().collection("chatbots").orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map(mapDoc));
  } catch (error) {
    res.status(500).json({ error: "failed_to_fetch_chatbots", message: error.message });
  }
}

async function createChatbot(req, res) {
  try {
    const payload = req.body || {};
    const now = FieldValue.serverTimestamp();
    const ref = await admin.firestore().collection("chatbots").add({
      name: payload.name || "",
      description: payload.description || "",
      status: payload.status || "active",
      flow: payload.flow || { nodes: [], edges: [] },
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    res.status(500).json({ error: "failed_to_create_chatbot", message: error.message });
  }
}

async function updateChatbotFlow(req, res) {
  try {
    const { id } = req.params;
    const { flow } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "invalid_request", message: "id is required" });
    }
    const ref = admin.firestore().collection("chatbots").doc(id);
    await ref.update({ flow: flow || { nodes: [], edges: [] }, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    res.json(mapDoc(updated));
  } catch (error) {
    res.status(500).json({ error: "failed_to_update_chatbot_flow", message: error.message });
  }
}

async function deleteChatbot(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "invalid_request", message: "id is required" });
    }
    await admin.firestore().collection("chatbots").doc(id).delete();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "failed_to_delete_chatbot", message: error.message });
  }
}

module.exports = {
  getAllChatbots,
  createChatbot,
  updateChatbotFlow,
  deleteChatbot,
};



const admin = require("firebase-admin");

async function getDashboardStats(req, res) {
  try {
    const db = admin.firestore();
    const [leadsSnap, adsSnap, requestsSnap, chatbotsSnap] = await Promise.all([
      db.collection("leads").get(),
      db.collection("ads_campaigns").get(),
      db.collection("requests").get(),
      db.collection("chatbots").get(),
    ]);

    res.json({
      totals: {
        leads: leadsSnap.size,
        ads: adsSnap.size,
        requests: requestsSnap.size,
        chatbots: chatbotsSnap.size,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "failed_to_fetch_dashboard_stats", message: error.message });
  }
}

module.exports = { getDashboardStats };





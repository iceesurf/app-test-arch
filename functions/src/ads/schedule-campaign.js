const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

/**
 * Função para agendar campanhas publicitárias
 * Esta função é chamada quando uma campanha é criada ou agendada
 */
// Triggers legacy desativados no ambiente atual. Manter apenas chamadas diretas.

/**
 * Função para processar campanhas agendadas
 * Esta função é executada periodicamente para verificar campanhas pendentes
 */
// processScheduledCampaigns desativado

// Funções auxiliares removidas - agora usando apenas endpoints HTTP

/**
 * Função para obter métricas de campanhas
 */
exports.getCampaignMetrics = onCall(async (request) => {
  // Verificar autenticação
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado");
  }

  try {
    const {
      campaignId,
    } = request.data;

    if (!campaignId) {
      throw new HttpsError("invalid-argument", "ID da campanha é obrigatório");
    }

    const campaignRef = admin.firestore().collection("ads_campaigns").doc(campaignId);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      throw new HttpsError("not-found", "Campanha não encontrada");
    }

    const campaignData = campaignDoc.data();

    // Simular atualização de métricas (em um cenário real, isso viria das APIs das redes sociais)
    const currentMetrics = campaignData.metrics || {};
    const updatedMetrics = {
      impressions: (currentMetrics.impressions || 0) + Math.floor(Math.random() * 50),
      clicks: (currentMetrics.clicks || 0) + Math.floor(Math.random() * 5),
      spent: parseFloat(((currentMetrics.spent || 0) + Math.random() * 10).toFixed(2)),
      ctr: parseFloat(((currentMetrics.clicks || 0) / (currentMetrics.impressions || 1) * 100).toFixed(2)),
      cpc: parseFloat(((currentMetrics.spent || 0) / (currentMetrics.clicks || 1)).toFixed(2)),
      cpm: parseFloat(((currentMetrics.spent || 0) / (currentMetrics.impressions || 1) * 1000).toFixed(2)),
    };

    // Atualizar métricas no Firestore
    await campaignRef.update({
      "metrics": updatedMetrics,
      "lastMetricsUpdate": admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      metrics: updatedMetrics,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao obter métricas:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Erro interno do servidor");
  }
});

/**
 * Função para pausar/reativar campanhas
 */
exports.updateCampaignStatus = onCall(async (request) => {
  // Verificar autenticação
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado");
  }

  try {
    const {
      campaignId,
      status,
    } = request.data;

    if (!campaignId || !status) {
      throw new HttpsError("invalid-argument", "ID da campanha e status são obrigatórios");
    }

    const campaignRef = admin.firestore().collection("ads_campaigns").doc(campaignId);
    const campaignDoc = await campaignRef.get();

    if (!campaignDoc.exists) {
      throw new HttpsError("not-found", "Campanha não encontrada");
    }

    // Atualizar status da campanha
    await campaignRef.update({
      status: status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Se a campanha foi pausada, cancelar jobs agendados
    if (status === "paused") {
      const jobsRef = admin.firestore().collection("scheduled_jobs");
      const pendingJobs = await jobsRef
          .where("campaignId", "==", campaignId)
          .where("status", "==", "pending")
          .get();

      const batch = admin.firestore().batch();
      pendingJobs.docs.forEach((jobDoc) => {
        batch.update(jobDoc.ref, {
          status: "cancelled",
          cancelledAt: FieldValue.serverTimestamp(),
        });
      });

      if (pendingJobs.docs.length > 0) {
        await batch.commit();
      }
    }

    return {
      success: true,
      message: `Status da campanha atualizado para ${status}`,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao atualizar status da campanha:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Erro interno do servidor");
  }
});

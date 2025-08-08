const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const admin = require("firebase-admin");
const {logger, logRequest, logError} = require("./src/utils/logger");

admin.initializeApp();

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: 15 * 60, // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Add request logging middleware
app.use(logRequest);

// More strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: 15 * 60,
  },
});

// Router base sem prefixo; montaremos em '/' e em '/api'
const router = express.Router();

// Healthcheck/hello
router.get("/hello", (request, response) => {
  response.send("Hello World!");
});

// Importar funções de autenticação
const {registerUser} = require("./src/auth/register-user");

// Importar funções de negócio
const {getAllLeads, createLead, updateLeadStatus, deleteLead} = require("./src/leads");
const {getAllCampaigns, createCampaign, updateCampaignStatusApi, deleteCampaign} = require("./src/ads");
const {getAllChatbots, createChatbot, updateChatbotFlow, deleteChatbot} = require("./src/agents");
const {getAllEmailCampaigns, getAllEmailTemplates, createEmailCampaign, createEmailTemplate, sendEmailCampaign, deleteEmailCampaign, deleteEmailTemplate} = require("./src/emails");
const {getAllRequests, createRequest, updateRequestStatus, deleteRequest} = require("./src/requests");
const {createContact} = require("./src/contacts");
const {getDashboardStats} = require("./src/dashboard"); // Novo
const engine = require("./src/routes/engine");
const webhook = require("./src/routes/webhook");
const conversations = require("./src/routes/conversations");
const settings = require("./src/routes/settings");

// Importar outras funções
const {
  getCampaignMetrics,
  updateCampaignStatus,
} = require("./src/ads/schedule-campaign");

// Rotas da API (sem prefixo)
router.post("/contacts", createContact);

// Apply auth rate limiting to authentication endpoints
router.post("/auth/register", authLimiter, registerUser);

// Rotas para Leads
router.get("/leads", getAllLeads);
router.post("/leads", createLead);
router.put("/leads/:id/status", updateLeadStatus);
router.delete("/leads/:id", deleteLead);

// Rotas para Ads
router.get("/ads", getAllCampaigns);
router.post("/ads", createCampaign);
router.put("/ads/:id/status", updateCampaignStatusApi);
router.delete("/ads/:id", deleteCampaign);

// Rotas para Agents
router.get("/agents", getAllChatbots);
router.post("/agents", createChatbot);
router.put("/agents/:id/flow", updateChatbotFlow);
router.delete("/agents/:id", deleteChatbot);

// Rotas para Emails
router.get("/emails/campaigns", getAllEmailCampaigns);
router.get("/emails/templates", getAllEmailTemplates);
router.post("/emails/campaigns", createEmailCampaign);
router.post("/emails/templates", createEmailTemplate);
router.put("/emails/campaigns/:id/send", sendEmailCampaign);
router.delete("/emails/campaigns/:id", deleteEmailCampaign);
router.delete("/emails/templates/:id", deleteEmailTemplate);

// Rotas para Requests
router.get("/requests", getAllRequests);
router.post("/requests", createRequest);
router.put("/requests/:id/status", updateRequestStatus);
router.delete("/requests/:id", deleteRequest);

// Rota para Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Engine / Cron
router.post("/engine/cron", engine.cronHandler);

// Webhook Meta
router.get("/webhook/meta", webhook.metaVerify);
router.post("/webhook/meta", webhook.metaReceive);

// Conversas
router.post("/conversations/send-message", conversations.sendMessageHandler);

// Settings
router.get("/settings/branding", settings.getBranding);
router.put("/settings/branding", settings.putBranding);
router.get("/settings/integrations", settings.getIntegrations);
router.put("/settings/integrations", settings.putIntegrations);

// Montar o router tanto na raiz quanto em /api para compatibilizar ambos cenários
app.use("/", router);
app.use("/api", router);

// Error handling middleware
app.use((error, req, res, next) => {
  logError(error, req);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  });
});

// Exportar funções de autenticação
exports.registerUser = registerUser;

// Exportar funções de campanhas publicitárias (desativado triggers legacy)
exports.getCampaignMetrics = getCampaignMetrics;
exports.updateCampaignStatus = updateCampaignStatus;

exports.api = functions.https.onRequest(
    {
      invoker: "public",
    },
    app,
);

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Inicializar Firebase Admin
admin.initializeApp();

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Para desenvolvimento, permitir sem autenticação
      req.user = {uid: "default-tenant"};
      return next();
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Para desenvolvimento, permitir sem autenticação
    req.user = {uid: "default-tenant"};
    next();
  }
};

// Importar rotas
const settingsRoutes = require("./src/routes/settings");

// Healthcheck/hello
app.get("/hello", (request, response) => {
  response.send("Hello World!");
});

app.get("/", (request, response) => {
  response.send("API funcionando!");
});

// Rotas de Settings com autenticação
app.get("/api/settings/branding", authenticateUser,
    settingsRoutes.getBranding);
app.put("/api/settings/branding", authenticateUser,
    settingsRoutes.putBranding);
app.get("/api/settings/integrations", authenticateUser,
    settingsRoutes.getIntegrations);
app.put("/api/settings/integrations", authenticateUser,
    settingsRoutes.putIntegrations);

exports.api = functions.https.onRequest(app);

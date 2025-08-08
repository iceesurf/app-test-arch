const admin = require("firebase-admin");

/**
 * Middleware de autenticação Firebase
 * Valida ID Token e popula req.user
 */
async function authMiddleware(req, res, next) {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    "/hello",
    "/webhook/meta",
    "/auth/register",
  ];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Token de autenticação não fornecido",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;

    // Derivar tenantId do usuário (simplificado por enquanto)
    req.tenantId = decodedToken.uid || "default-tenant";

    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res.status(401).json({
      error: "unauthorized",
      message: "Token inválido ou expirado",
    });
  }
}

module.exports = {authMiddleware};

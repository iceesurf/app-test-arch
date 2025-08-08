// Configuration template for production deployment
module.exports = {
  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'app-arch-6c99b',
  },

  // Meta WhatsApp API
  meta: {
    whatsappToken: process.env.META_WHATSAPP_TOKEN,
    phoneNumberId: process.env.META_PHONE_NUMBER_ID,
    verifyToken: process.env.META_VERIFY_TOKEN,
  },

  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // External APIs
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
};


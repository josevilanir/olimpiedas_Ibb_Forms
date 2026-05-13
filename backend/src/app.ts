import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import modalityRoutes from "./routes/modality.routes";
import participantRoutes from "./routes/participant.routes";
import adminRoutes from "./routes/admin.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { metricsMiddleware } from "./middlewares/metrics.middleware";
import { prisma } from "./lib/prisma";
import logger from "./lib/logger";

const app = express();

// Security headers
app.use(helmet());

// Gzip/Brotli compression for all responses
app.use(compression());

// Rate limit global: proteção anti-DDoS/bot
// Um usuário normal faz ~10-15 requests por sessão (landing, modalities, formulário, submit).
// Com 500 usuários individuais, cada um tem seu próprio IP.
// 60 req/min por IP é generoso para uso normal e bloqueia bots agressivos.
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // Janela de 1 minuto
  max: 100,                    // Limite de segurança para produção
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Aguarde um momento e tente novamente." },
  skip: (req) => req.path === "/health",
});
app.use(globalLimiter);

// Rate limit de inscrição: proteção contra spam de registros
// Um usuário pode se inscrever e inscrever seus filhos = ~3-5 POSTs legítimos.
const registrationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutos
  max: 20,                     // Limite de segurança para produção (permite múltiplas inscrições por família)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite de inscrições atingido. Aguarde alguns minutos e tente novamente." },
  skipFailedRequests: true,    // Não conta requests que deram erro de validação
});

// Restrict CORS to the known frontend origins only.
// CORS_ALLOWED_ORIGINS in Fly.io secrets can override (comma-separated list).
const ALLOWED_ORIGINS = (
  process.env.CORS_ALLOWED_ORIGINS ?? "https://olimpiedas-ibb-forms.vercel.app"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (server-to-server, Postman, health probes)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
  })
);
app.use(express.json());

// Metrics middleware — tracks active requests, slow requests, and periodic snapshots
app.use(metricsMiddleware);

// Health check with database ping
app.get("/health", async (_req, res) => {
  const health: Record<string, unknown> = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.database = { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    health.status = "degraded";
    health.database = { status: "error" };
    logger.error({ err }, "Health check database ping failed");
    res.status(503).json(health);
    return;
  }

  res.json(health);
});

app.use("/api/v1/modalities", modalityRoutes);
app.use("/api/v1/participants", registrationLimiter, participantRoutes);
app.use("/api/v1/admin", adminRoutes);

// Centralized error handler (must be last)
app.use(errorMiddleware);

export default app;

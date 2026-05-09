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

const app = express();

// Security headers
app.use(helmet());

// Gzip/Brotli compression for all responses
app.use(compression());

// Global rate limit: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});
app.use(globalLimiter);

// Stricter rate limit on the registration endpoint: 5 per 30 minutes per IP
const registrationLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite de inscrições atingido. Aguarde 30 minutos e tente novamente." },
});

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/modalities", modalityRoutes);
app.use("/api/v1/participants", registrationLimiter, participantRoutes);
app.use("/api/v1/admin", adminRoutes);

// Centralized error handler (must be last)
app.use(errorMiddleware);

export default app;

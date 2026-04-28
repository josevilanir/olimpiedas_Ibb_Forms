import "dotenv/config";
import express from "express";
import cors from "cors";
import modalityRoutes from "./routes/modality.routes";
import participantRoutes from "./routes/participant.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/modalities", modalityRoutes);
app.use("/api/v1/participants", participantRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;

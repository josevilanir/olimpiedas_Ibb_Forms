import { Router } from "express";
import { registerParticipant } from "../controllers/participant.controller";

const router = Router();

router.post("/", registerParticipant);

export default router;

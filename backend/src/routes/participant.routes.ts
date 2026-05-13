import { Router } from "express";
import { registerParticipantController } from "../controllers/participant.controller";

const router = Router();

router.post("/", registerParticipantController);

export default router;

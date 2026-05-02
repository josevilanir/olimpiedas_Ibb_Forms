import { Router } from "express";
import { login, getParticipants, removeParticipant, editParticipant, getByModality, exportExcel, exportFinance, stats } from "../controllers/admin.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);

router.use(requireAuth);

router.get("/participants", getParticipants);
router.delete("/participants/:id", removeParticipant);
router.put("/participants/:id", editParticipant);
router.get("/modalities/participants", getByModality);
router.get("/stats", stats);
router.get("/export", exportExcel);
router.get("/export-finance", exportFinance);

export default router;

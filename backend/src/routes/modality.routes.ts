import { Router } from "express";
import { listModalities } from "../controllers/modality.controller";

const router = Router();

router.get("/", listModalities);

export default router;

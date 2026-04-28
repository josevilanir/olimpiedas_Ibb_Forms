import { Request, Response } from "express";
import { getAllModalities } from "../services/modality.service";

export async function listModalities(req: Request, res: Response) {
  const modalities = await getAllModalities();
  res.json({ data: modalities });
}

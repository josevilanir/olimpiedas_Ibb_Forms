import { Request, Response } from "express";
import {
  loginAdmin,
  listParticipants,
  deleteParticipant,
  updateParticipant,
  getParticipantsByModality,
} from "../services/admin.service";
import { exportParticipantsToExcel } from "../services/export.service";
import { getStats } from "../services/stats.service";
import { MembershipStatus } from "../generated/prisma/client";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios." });
      return;
    }
    const result = await loginAdmin(email, password);
    res.json({ data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message === "INVALID_CREDENTIALS") {
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }
    console.error("[login]", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getParticipants(req: Request, res: Response) {
  const modalityId = Array.isArray(req.query.modalityId)
    ? (req.query.modalityId[0] as string)
    : (req.query.modalityId as string | undefined);
  const participants = await listParticipants(modalityId);
  res.json({ data: participants });
}

export async function removeParticipant(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    await deleteParticipant(id);
    res.json({ message: "Inscrição removida com sucesso." });
  } catch {
    res.status(404).json({ error: "Inscrição não encontrada." });
  }
}

export async function editParticipant(req: Request, res: Response) {
  try {
    const id = req.params["id"] as string;
    const participant = await updateParticipant(id, req.body);
    res.json({ data: participant });
  } catch {
    res.status(404).json({ error: "Inscrição não encontrada." });
  }
}

export async function getByModality(_req: Request, res: Response) {
  const data = await getParticipantsByModality();
  res.json({ data });
}

export async function stats(req: Request, res: Response) {
  const isMember = req.query.isMember as MembershipStatus | undefined;
  const data = await getStats(isMember);
  res.json({ data });
}

export async function exportExcel(req: Request, res: Response) {
  try {
    const modalityId = Array.isArray(req.query.modalityId)
      ? (req.query.modalityId[0] as string)
      : (req.query.modalityId as string | undefined);

    const buffer = await exportParticipantsToExcel(modalityId);
    const filename = `inscritos_olimpiadas_ibb_${Date.now()}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer as ArrayBuffer));
  } catch (error) {
    console.error("[exportExcel]", error);
    res.status(500).json({ error: "Erro ao gerar planilha." });
  }
}

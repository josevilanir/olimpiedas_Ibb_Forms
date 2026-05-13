import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  loginAdmin,
  listParticipants,
  deleteParticipantById,
  updateParticipantById,
  getParticipantsByModality,
  getAdminById,
} from "../services/admin.service";
import { exportParticipantsToExcel, exportFinanceToExcel } from "../services/export.service";
import { getStats } from "../services/stats.service";
import { MembershipStatus, Prisma } from "../generated/prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../errors/AppError";
import logger from "../lib/logger";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateParticipantSchema = z
  .object({
    fullName: z.string().min(1),
    parentName: z.string().nullable().optional().transform((v) => v ?? undefined),
    whatsapp: z.string().min(1),
    gender: z.enum(["MASCULINO", "FEMININO"]),
    isMember: z.enum(["SIM", "NAO", "GR"]),
    healthIssues: z.string().nullable().optional().transform((v) => v ?? undefined),
    birthDate: z.string().min(1),
    paymentStatus: z.enum(["PENDENTE", "PAGO", "CANCELADO"]),
    modalityIds: z.array(z.string().min(1)).min(1),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização.",
  });

function isRecordNotFound(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError("VALIDATION_ERROR", 400, "Email e senha são obrigatórios."));
  }

  try {
    const data = await loginAdmin(result.data.email, result.data.password);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const admin = await getAdminById(req.adminId!);
    res.json({ data: admin });
  } catch (err) {
    next(err);
  }
}

export async function getParticipants(req: Request, res: Response, next: NextFunction) {
  try {
    const modalityId = Array.isArray(req.query.modalityId)
      ? (req.query.modalityId[0] as string)
      : (req.query.modalityId as string | undefined);
    const participants = await listParticipants(modalityId);
    res.json({ data: participants });
  } catch (err) {
    next(err);
  }
}

export async function removeParticipant(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteParticipantById(req.params["id"] as string);
    res.json({ message: "Inscrição removida com sucesso." });
  } catch (err) {
    if (isRecordNotFound(err)) {
      next(new AppError("NOT_FOUND", 404, "Inscrição não encontrada."));
    } else {
      next(err);
    }
  }
}

export async function editParticipant(req: Request, res: Response, next: NextFunction) {
  const parsed = updateParticipantSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(
      new AppError("VALIDATION_ERROR", 422, parsed.error.issues[0]?.message ?? "Dados inválidos.")
    );
  }

  try {
    const participant = await updateParticipantById(req.params["id"] as string, parsed.data);
    res.json({ data: participant });
  } catch (err) {
    if (isRecordNotFound(err)) {
      next(new AppError("NOT_FOUND", 404, "Inscrição não encontrada."));
    } else {
      next(err);
    }
  }
}

export async function getByModality(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getParticipantsByModality();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const isMember = req.query.isMember as MembershipStatus | undefined;
    const modalityId = Array.isArray(req.query.modalityId)
      ? (req.query.modalityId[0] as string)
      : (req.query.modalityId as string | undefined);
    const data = await getStats(isMember, modalityId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function exportExcel(req: Request, res: Response, next: NextFunction) {
  try {
    const modalityId = Array.isArray(req.query.modalityId)
      ? (req.query.modalityId[0] as string)
      : (req.query.modalityId as string | undefined);

    const buffer = await exportParticipantsToExcel(modalityId);
    const filename = `inscritos_olimpiadas_ibb_${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer as ArrayBuffer));
  } catch (err) {
    logger.error({ err }, "[exportExcel] failed");
    next(err);
  }
}

export async function exportFinance(_req: Request, res: Response, next: NextFunction) {
  try {
    const buffer = await exportFinanceToExcel();
    const filename = `financeiro_olimpiadas_ibb_${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer as ArrayBuffer));
  } catch (err) {
    logger.error({ err }, "[exportFinance] failed");
    next(err);
  }
}

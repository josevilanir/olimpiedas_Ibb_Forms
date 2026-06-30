import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { registerParticipant } from "../services/participant.service";
import { AppError } from "../errors/AppError";

const registerSchema = z.object({
  isForChild: z.boolean(),
  isMember: z.enum(["SIM", "NAO", "GR"]),
  birthDate: z.string().min(1),
  fullName: z.string().min(1),
  parentName: z.string().optional(),
  whatsapp: z.string().min(1),
  gender: z.enum(["MASCULINO", "FEMININO"]),
  healthIssues: z.string().optional(),
  termsAccepted: z.boolean(),
  modalityIds: z.array(z.string().min(1)),
});

export async function registerParticipantController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (process.env.REGISTRATION_CLOSED === "true") {
    return next(
      new AppError(
        "REGISTRATION_CLOSED",
        403,
        "As inscrições estão encerradas.",
      ),
    );
  }

  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return next(
      new AppError(
        "VALIDATION_ERROR",
        422,
        "Dados inválidos: " + result.error.issues[0].message,
      ),
    );
  }

  try {
    const participant = await registerParticipant(result.data);
    res.status(201).json({ data: participant });
  } catch (err) {
    next(err);
  }
}

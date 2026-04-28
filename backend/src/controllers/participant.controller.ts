import { Request, Response } from "express";
import { createParticipant } from "../services/participant.service";

export async function registerParticipant(req: Request, res: Response) {
  try {
    const participant = await createParticipant(req.body);
    res.status(201).json({ data: participant });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "INTERNAL_ERROR";

    if (message === "TERMS_NOT_ACCEPTED") {
      res.status(422).json({ error: "Você precisa aceitar os termos para se inscrever." });
      return;
    }
    if (message === "NO_MODALITY_SELECTED") {
      res.status(422).json({ error: "Selecione ao menos uma modalidade." });
      return;
    }
    if (message === "INVALID_BIRTH_DATE") {
      res.status(422).json({ error: "Data de nascimento inválida." });
      return;
    }
    if (message === "INVALID_MODALITY") {
      res.status(422).json({ error: "Modalidade inválida selecionada." });
      return;
    }
    if (message.startsWith("NOT_ELIGIBLE:")) {
      const modalityName = message.replace("NOT_ELIGIBLE:", "");
      res.status(422).json({
        error: `Você não atende aos requisitos para a modalidade: ${modalityName}.`,
      });
      return;
    }

    console.error("[registerParticipant]", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

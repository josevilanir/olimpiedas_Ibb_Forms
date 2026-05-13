import { MembershipStatus, Gender } from "../generated/prisma/client";
import { calculateAge, isEligibleForModality } from "../utils/age";
import { AppError } from "../errors/AppError";
import { findModalitiesByIds } from "../repositories/modality.repository";
import { createParticipant } from "../repositories/participant.repository";

export interface CreateParticipantInput {
  isForChild: boolean;
  isMember: MembershipStatus;
  birthDate: string;
  fullName: string;
  parentName?: string;
  whatsapp: string;
  gender: Gender;
  healthIssues?: string;
  termsAccepted: boolean;
  modalityIds: string[];
}

export async function registerParticipant(input: CreateParticipantInput) {
  const { isForChild, isMember, birthDate, fullName, parentName, whatsapp, gender, healthIssues, termsAccepted, modalityIds } = input;

  if (!termsAccepted) {
    throw new AppError("TERMS_NOT_ACCEPTED", 422, "Você precisa aceitar os termos para se inscrever.");
  }

  if (modalityIds.length === 0) {
    throw new AppError("NO_MODALITY_SELECTED", 422, "Selecione ao menos uma modalidade.");
  }

  const parsedBirthDate = new Date(birthDate);
  if (isNaN(parsedBirthDate.getTime())) {
    throw new AppError("INVALID_BIRTH_DATE", 422, "Data de nascimento inválida.");
  }

  const age = calculateAge(parsedBirthDate);
  const memberIsValid = isMember === "SIM" || isMember === "GR";

  const modalities = await findModalitiesByIds(modalityIds);
  if (modalities.length !== modalityIds.length) {
    throw new AppError("INVALID_MODALITY", 422, "Modalidade inválida selecionada.");
  }

  for (const modality of modalities) {
    const eligible = isEligibleForModality(age, memberIsValid, modality.minAge, modality.maxAge, modality.requiresMembership);
    if (!eligible) {
      throw new AppError(`NOT_ELIGIBLE:${modality.name}`, 422, `Você não atende aos requisitos para a modalidade: ${modality.name}.`);
    }
  }

  return createParticipant({
    isForChild,
    isMember,
    birthDate: parsedBirthDate,
    fullName,
    parentName,
    whatsapp,
    gender,
    healthIssues,
    termsAccepted,
    modalityIds,
  });
}

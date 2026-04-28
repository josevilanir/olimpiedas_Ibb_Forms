import { prisma } from "../lib/prisma";
import { MembershipStatus, Gender } from "../generated/prisma/client";
import { calculateAge, isEligibleForModality } from "../utils/age";

interface CreateParticipantInput {
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

export async function createParticipant(input: CreateParticipantInput) {
  const {
    isForChild,
    isMember,
    birthDate,
    fullName,
    parentName,
    whatsapp,
    gender,
    healthIssues,
    termsAccepted,
    modalityIds,
  } = input;

  if (!termsAccepted) {
    throw new Error("TERMS_NOT_ACCEPTED");
  }

  if (modalityIds.length === 0) {
    throw new Error("NO_MODALITY_SELECTED");
  }

  const parsedBirthDate = new Date(birthDate);
  if (isNaN(parsedBirthDate.getTime())) {
    throw new Error("INVALID_BIRTH_DATE");
  }

  const age = calculateAge(parsedBirthDate);
  const memberIsValid = isMember === "SIM" || isMember === "GR";

  // Validate each selected modality
  const modalities = await prisma.modality.findMany({
    where: { id: { in: modalityIds } },
  });

  if (modalities.length !== modalityIds.length) {
    throw new Error("INVALID_MODALITY");
  }

  for (const modality of modalities) {
    const eligible = isEligibleForModality(
      age,
      memberIsValid,
      modality.minAge,
      modality.maxAge,
      modality.requiresMembership
    );
    if (!eligible) {
      throw new Error(`NOT_ELIGIBLE:${modality.name}`);
    }
  }

  const participant = await prisma.participant.create({
    data: {
      isForChild,
      isMember,
      birthDate: parsedBirthDate,
      fullName,
      parentName,
      whatsapp,
      gender,
      healthIssues,
      termsAccepted,
      subscriptions: {
        create: modalityIds.map((modalityId) => ({ modalityId })),
      },
    },
    include: {
      subscriptions: { include: { modality: true } },
    },
  });

  return participant;
}

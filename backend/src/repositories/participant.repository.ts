import { prisma } from "../lib/prisma";
import { Gender, MembershipStatus, PaymentStatus } from "../generated/prisma/client";

interface CreateParticipantData {
  isForChild: boolean;
  isMember: MembershipStatus;
  birthDate: Date;
  fullName: string;
  parentName?: string;
  whatsapp: string;
  gender: Gender;
  healthIssues?: string;
  termsAccepted: boolean;
  modalityIds: string[];
}

export async function createParticipant(data: CreateParticipantData) {
  const { modalityIds, ...rest } = data;
  return prisma.participant.create({
    data: {
      ...rest,
      subscriptions: {
        create: modalityIds.map((modalityId) => ({ modalityId })),
      },
    },
    include: {
      subscriptions: { include: { modality: true } },
    },
  });
}

export async function findParticipants(modalityId?: string) {
  return prisma.participant.findMany({
    where: modalityId
      ? { subscriptions: { some: { modalityId } } }
      : undefined,
    include: {
      subscriptions: { include: { modality: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteParticipant(id: string) {
  return prisma.participant.delete({ where: { id } });
}

export async function updateParticipant(
  id: string,
  data: Partial<{
    fullName: string;
    parentName: string;
    whatsapp: string;
    gender: Gender;
    isMember: MembershipStatus;
    healthIssues: string;
    birthDate: string;
    paymentStatus: PaymentStatus;
    modalityIds: string[];
  }>
) {
  const { modalityIds, birthDate, paymentStatus, ...rest } = data;

  const updateData: Record<string, unknown> = { ...rest };
  if (birthDate) updateData.birthDate = new Date(birthDate);
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
    updateData.paidAt = paymentStatus === "PAGO" ? new Date() : null;
  }

  if (modalityIds) {
    await prisma.subscription.deleteMany({ where: { participantId: id } });
    await prisma.subscription.createMany({
      data: modalityIds.map((modalityId) => ({ participantId: id, modalityId })),
    });
  }

  return prisma.participant.update({
    where: { id },
    data: updateData,
    include: { subscriptions: { include: { modality: true } } },
  });
}

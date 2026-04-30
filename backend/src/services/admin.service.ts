import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Gender, MembershipStatus, PaymentStatus } from "../generated/prisma/client";

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const token = jwt.sign(
    { adminId: user.id },
    process.env.JWT_SECRET ?? "",
    { expiresIn: "8h" }
  );

  return { token, admin: { id: user.id, name: user.name, email: user.email } };
}

export async function listParticipants(modalityId?: string) {
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
  const { modalityIds, birthDate, ...rest } = data;

  const updateData: Record<string, unknown> = { ...rest };
  if (birthDate) updateData.birthDate = new Date(birthDate);

  // Logic for paidAt
  if (data.paymentStatus) {
    if (data.paymentStatus === "PAGO") {
      updateData.paidAt = new Date();
    } else {
      updateData.paidAt = null;
    }
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

export async function getParticipantsByModality() {
  const modalities = await prisma.modality.findMany({
    include: {
      subscriptions: {
        include: { participant: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return modalities;
}

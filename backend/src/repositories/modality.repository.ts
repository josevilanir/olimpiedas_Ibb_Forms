import { prisma } from "../lib/prisma";

export async function findAllModalities() {
  return prisma.modality.findMany({ orderBy: { name: "asc" } });
}

export async function findModalitiesByIds(ids: string[]) {
  return prisma.modality.findMany({ where: { id: { in: ids } } });
}

export async function findModalitiesWithParticipants() {
  return prisma.modality.findMany({
    include: {
      subscriptions: { include: { participant: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function findModalitiesForExport(modalityId?: string) {
  return prisma.modality.findMany({
    where: modalityId ? { id: modalityId } : undefined,
    include: {
      subscriptions: { include: { participant: true } },
    },
    orderBy: { name: "asc" },
  });
}

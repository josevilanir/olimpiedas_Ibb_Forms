import { prisma } from "../lib/prisma";

export async function getAllModalities() {
  return prisma.modality.findMany({
    orderBy: { name: "asc" },
  });
}

import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";

export async function groupSubscriptionsByModality(where: Prisma.SubscriptionWhereInput) {
  return prisma.subscription.groupBy({
    by: ["modalityId"],
    where,
    _count: { modalityId: true },
  });
}

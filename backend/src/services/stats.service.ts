import { MembershipStatus, PaymentStatus, Prisma } from "../generated/prisma/client";
import {
  groupParticipantsByGender,
  groupParticipantsByMember,
  groupParticipantsByPayment,
  findParticipantsMinimal,
} from "../repositories/participant.repository";
import { groupSubscriptionsByModality } from "../repositories/subscription.repository";
import { findAllModalities } from "../repositories/modality.repository";
import { calculateAge } from "../utils/age";

export async function getStats(isMember?: MembershipStatus, modalityId?: string) {
  const whereActive: Prisma.ParticipantWhereInput = {
    paymentStatus: { not: "CANCELADO" as PaymentStatus },
    ...(isMember ? { isMember } : {}),
    ...(modalityId ? { subscriptions: { some: { modalityId } } } : {}),
  };

  const whereAll: Prisma.ParticipantWhereInput = {
    ...(isMember ? { isMember } : {}),
    ...(modalityId ? { subscriptions: { some: { modalityId } } } : {}),
  };

  const whereSubscription: Prisma.SubscriptionWhereInput = {
    participant: {
      paymentStatus: { not: "CANCELADO" as PaymentStatus },
      ...(isMember ? { isMember } : {}),
    },
    ...(modalityId ? { modalityId } : {}),
  };

  const [
    genderGroups,
    memberGroups,
    paymentGroups,
    activeParticipants,
    subscriptionGroups,
    modalities,
  ] = await Promise.all([
    groupParticipantsByGender(whereActive),
    groupParticipantsByMember(whereActive),
    groupParticipantsByPayment(whereAll),
    findParticipantsMinimal(whereActive),
    groupSubscriptionsByModality(whereSubscription),
    findAllModalities(),
  ]);

  const genderCount = { MASCULINO: 0, FEMININO: 0 };
  for (const g of genderGroups) {
    genderCount[g.gender] = g._count.gender;
  }

  const memberCount = { SIM: 0, NAO: 0, GR: 0 };
  for (const m of memberGroups) {
    memberCount[m.isMember] = m._count.isMember;
  }

  const paymentCount = { PENDENTE: 0, PAGO: 0, CANCELADO: 0 };
  for (const p of paymentGroups) {
    paymentCount[p.paymentStatus] = p._count.paymentStatus;
  }

  const ageGroups = { "3-9": 0, "10-13": 0, "14-17": 0, "18+": 0 };
  let estimatedRevenue = 0;
  let actualRevenue = 0;
  const FEE = 15.09;

  for (const p of activeParticipants) {
    const age = calculateAge(new Date(p.birthDate));
    const isExempt = age <= 8;

    if (!isExempt) estimatedRevenue += FEE;
    if (p.paymentStatus === "PAGO" && !isExempt) actualRevenue += FEE;

    if (age <= 9) ageGroups["3-9"]++;
    else if (age <= 13) ageGroups["10-13"]++;
    else if (age <= 17) ageGroups["14-17"]++;
    else ageGroups["18+"]++;
  }

  const subCountMap = new Map<string, number>();
  for (const s of subscriptionGroups) {
    subCountMap.set(s.modalityId, s._count.modalityId);
  }

  const modalityStats = modalities.map((m) => ({
    id: m.id,
    name: m.name,
    count: subCountMap.get(m.id) ?? 0,
    maxSpots: m.maxSpots ?? null,
  }));

  return {
    totalParticipants: activeParticipants.length,
    genderCount,
    memberCount,
    paymentCount,
    ageGroups,
    modalityStats,
    revenue: {
      estimated: Number(estimatedRevenue.toFixed(2)),
      actual: Number(actualRevenue.toFixed(2)),
    },
  };
}

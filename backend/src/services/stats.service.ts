import { prisma } from "../lib/prisma";
import { MembershipStatus, PaymentStatus } from "../generated/prisma/client";

function calcAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export async function getStats(isMember?: MembershipStatus, modalityId?: string) {
  const whereActive = {
    paymentStatus: { not: "CANCELADO" as PaymentStatus },
    ...(isMember ? { isMember } : {}),
    ...(modalityId ? { subscriptions: { some: { modalityId } } } : {}),
  };

  const whereAll = {
    ...(isMember ? { isMember } : {}),
    ...(modalityId ? { subscriptions: { some: { modalityId } } } : {}),
  };

  const [
    genderGroups,
    memberGroups,
    paymentGroups,
    activeParticipants,
    subscriptionGroups,
    modalities,
  ] = await Promise.all([
    // DB-level aggregation: gender distribution (active only)
    prisma.participant.groupBy({
      by: ["gender"],
      where: whereActive,
      _count: { gender: true },
    }),
    // DB-level aggregation: membership distribution (active only)
    prisma.participant.groupBy({
      by: ["isMember"],
      where: whereActive,
      _count: { isMember: true },
    }),
    // DB-level aggregation: payment status (all, including cancelled)
    prisma.participant.groupBy({
      by: ["paymentStatus"],
      where: whereAll,
      _count: { paymentStatus: true },
    }),
    // Minimal projection: only birthDate and paymentStatus for age/revenue calculation
    prisma.participant.findMany({
      where: whereActive,
      select: { birthDate: true, paymentStatus: true },
    }),
    // DB-level aggregation: subscription counts per modality (active participants only)
    prisma.subscription.groupBy({
      by: ["modalityId"],
      where: {
        participant: {
          paymentStatus: { not: "CANCELADO" as PaymentStatus },
          ...(isMember ? { isMember } : {}),
        },
        ...(modalityId ? { modalityId } : {}),
      },
      _count: { modalityId: true },
    }),
    prisma.modality.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Map DB results to flat objects
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

  // Age groups and revenue — computed from minimal participant data
  const ageGroups = { "3-9": 0, "10-13": 0, "14-17": 0, "18+": 0 };
  let estimatedRevenue = 0;
  let actualRevenue = 0;
  const FEE = 15.09;

  for (const p of activeParticipants) {
    const age = calcAge(new Date(p.birthDate));
    const isExempt = age <= 8;

    if (!isExempt) estimatedRevenue += FEE;
    if (p.paymentStatus === "PAGO" && !isExempt) actualRevenue += FEE;

    if (age <= 9) ageGroups["3-9"]++;
    else if (age <= 13) ageGroups["10-13"]++;
    else if (age <= 17) ageGroups["14-17"]++;
    else ageGroups["18+"]++;
  }

  // Map subscription groupBy results to modality stats
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

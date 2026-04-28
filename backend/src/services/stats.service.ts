import { prisma } from "../lib/prisma";

function calcAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export async function getStats() {
  const [participants, modalities] = await Promise.all([
    prisma.participant.findMany({
      include: { subscriptions: { include: { modality: true } } },
    }),
    prisma.modality.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalParticipants = participants.length;

  const genderCount = { MASCULINO: 0, FEMININO: 0 };
  const memberCount = { SIM: 0, NAO: 0, GR: 0 };
  const ageGroups = { "3-9": 0, "10-13": 0, "14-17": 0, "18+": 0 };

  for (const p of participants) {
    genderCount[p.gender]++;
    memberCount[p.isMember]++;
    const age = calcAge(new Date(p.birthDate));
    if (age <= 9) ageGroups["3-9"]++;
    else if (age <= 13) ageGroups["10-13"]++;
    else if (age <= 17) ageGroups["14-17"]++;
    else ageGroups["18+"]++;
  }

  const modalityStats = modalities.map((m) => ({
    id: m.id,
    name: m.name,
    count: m._count.subscriptions,
  }));

  return { totalParticipants, genderCount, memberCount, ageGroups, modalityStats };
}

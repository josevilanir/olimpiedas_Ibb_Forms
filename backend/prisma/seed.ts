import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const modalities = [
  {
    name: "Corrida Longa (5km)",
    minAge: null,
    maxAge: null,
    requiresMembership: false,
    coordinatorName: "Emicarlo Souza e Carlos Mora",
  },
  {
    name: "Corrida Curta Adulta (tiros de 100m, 150m e 200m)",
    minAge: 14,
    maxAge: null,
    requiresMembership: false,
    coordinatorName: "Emicarlo Souza e Carlos Mora",
  },
  {
    name: "Corrida Curta Pré Teens (tiros de 100m e 150m)",
    minAge: 9,
    maxAge: 13,
    requiresMembership: false,
    coordinatorName: "Emicarlo Souza e Carlos Mora",
  },
  {
    name: "Corrida Curta Kids (tiros de 10m, 20m e 30m)",
    minAge: 3,
    maxAge: 8,
    requiresMembership: false,
    coordinatorName: "Emicarlo Souza e Carlos Mora",
  },
  {
    name: "Caminhada (2,5km)",
    minAge: null,
    maxAge: null,
    requiresMembership: false,
    coordinatorName: "Emicarlo Souza e Carlos Mora",
  },
  {
    name: "Futsal",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Jonatas Silveira (Jow)",
  },
  {
    name: "Futsal Pré Teens",
    minAge: 10,
    maxAge: 13,
    requiresMembership: true,
    coordinatorName: "Jonatas Silveira (Jow)",
  },
  {
    name: "Volei de Quadra",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Daniel César",
  },
  {
    name: "Queimada",
    minAge: 11,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Jonatas Silveira (Jow)",
  },
  {
    name: "Tenis de Mesa",
    minAge: 9,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Lucas Santos",
  },
  {
    name: "Circuito Adulto (corrida de obstáculos)",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Fran Missionário",
  },
  {
    name: "Circuito Kids (corrida de obstáculos)",
    minAge: 9,
    maxAge: 13,
    requiresMembership: true,
    coordinatorName: "Fran Missionário",
  },
  {
    name: "Natação",
    minAge: 9,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Jonatas Silveira (Jow)",
  },
  {
    name: "Basquete",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Jonatas Silveira (Jow)",
  },
  {
    name: "E-Sports (FIFA)",
    minAge: 9,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Gustavo Felipe e Davi Severiano",
  },
  {
    name: "E-Sports (Counter-Strike [CS])",
    minAge: 9,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Gustavo Felipe e Davi Severiano",
  },
  {
    name: "E-Sports (League of Legends [Lol])",
    minAge: 9,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Gustavo Felipe e Davi Severiano",
  },
  {
    name: "Treino Funcional (não é competição)",
    minAge: null,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "Jonatas Silveira (Jow)",
  },
];

async function main() {
  console.log("Seeding database...");

  // Seed modalidades
  for (const modality of modalities) {
    await prisma.modality.upsert({
      where: { name: modality.name },
      update: modality,
      create: modality,
    });
  }

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ibb.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.ADMIN_NAME ?? "Administrador IBB";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

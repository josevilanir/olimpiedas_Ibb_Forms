import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const modalities = [
  // Modalidades abertas (sem restrição de membresia, sem limite de idade)
  {
    name: "Corrida",
    minAge: null,
    maxAge: null,
    requiresMembership: false,
    coordinatorName: "A definir",
  },
  {
    name: "Caminhada",
    minAge: null,
    maxAge: null,
    requiresMembership: false,
    coordinatorName: "A definir",
  },
  // Modalidades exclusivas para membros IBB/GR com faixas etárias
  {
    name: "Futebol Society (Masculino)",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Futsal Feminino",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Vôlei",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Basquete",
    minAge: 14,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Tênis de Mesa",
    minAge: 10,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Xadrez",
    minAge: 10,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Pebolim (Totó)",
    minAge: 10,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Cabo de Guerra",
    minAge: 10,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Bíblia Quiz",
    minAge: 10,
    maxAge: null,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  // Kids
  {
    name: "Corrida de Saco (Kids)",
    minAge: 3,
    maxAge: 9,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Colher e Ovo (Kids)",
    minAge: 3,
    maxAge: 9,
    requiresMembership: true,
    coordinatorName: "A definir",
  },
  {
    name: "Cabo de Guerra (Kids)",
    minAge: 3,
    maxAge: 9,
    requiresMembership: true,
    coordinatorName: "A definir",
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

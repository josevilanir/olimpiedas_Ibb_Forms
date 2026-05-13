import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Deletando todos os participantes...");
  const result = await prisma.participant.deleteMany({});
  console.log(`Sucesso: ${result.count} participantes deletados (suas inscrições foram deletadas em cascata).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

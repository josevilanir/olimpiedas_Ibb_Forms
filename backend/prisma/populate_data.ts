import "dotenv/config";
import { PrismaClient, MembershipStatus, Gender, PaymentStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fakerPT_BR as faker } from "@faker-js/faker";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando a população do banco de dados com dados de teste...");

  // 1. Buscar modalidades existentes
  const modalities = await prisma.modality.findMany();
  if (modalities.length === 0) {
    console.error("Nenhuma modalidade encontrada. Por favor, execute o seed primeiro: npm run prisma:seed");
    return;
  }

  console.log(`Encontradas ${modalities.length} modalidades.`);

  const COUNT = 300;
  let createdCount = 0;

  for (let i = 0; i < COUNT; i++) {
    const gender = faker.helpers.arrayElement([Gender.MASCULINO, Gender.FEMININO]);
    const isMember = faker.helpers.arrayElement([MembershipStatus.SIM, MembershipStatus.NAO, MembershipStatus.GR]);
    
    // Gerar idade entre 5 e 50 anos
    const birthDate = faker.date.birthdate({ min: 5, max: 50, mode: 'age' });
    const age = new Date().getFullYear() - birthDate.getFullYear();

    const participant = await prisma.participant.create({
      data: {
        fullName: faker.person.fullName({ sex: gender === Gender.MASCULINO ? 'male' : 'female' }),
        whatsapp: faker.phone.number({ style: 'international' }),
        birthDate: birthDate,
        gender: gender,
        isMember: isMember,
        isForChild: age < 14,
        parentName: age < 14 ? faker.person.fullName() : null,
        termsAccepted: true,
        paymentStatus: faker.helpers.weightedArrayElement([
          { value: PaymentStatus.PAGO, weight: 70 },
          { value: PaymentStatus.PENDENTE, weight: 25 },
          { value: PaymentStatus.CANCELADO, weight: 5 },
        ]),
        paidAt: null, // Simplificado
        healthIssues: faker.helpers.maybe(() => "Nenhuma", { probability: 0.8 }) || "Asma leve",
      }
    });

    // Adicionar entre 1 e 3 modalidades aleatórias
    const numSubscriptions = faker.number.int({ min: 1, max: 3 });
    
    // Filtrar modalidades compatíveis com a idade (se houver restrição)
    const compatibleModalities = modalities.filter(m => {
      const minAgeOk = !m.minAge || age >= m.minAge;
      const maxAgeOk = !m.maxAge || age <= m.maxAge;
      return minAgeOk && maxAgeOk;
    });

    const selectedModalities = faker.helpers.arrayElements(
      compatibleModalities.length > 0 ? compatibleModalities : modalities,
      Math.min(numSubscriptions, compatibleModalities.length || 1)
    );

    for (const modality of selectedModalities) {
      try {
        await prisma.subscription.create({
          data: {
            participantId: participant.id,
            modalityId: modality.id,
          }
        });
      } catch (err) {
        // Ignorar duplicatas se houver
      }
    }

    createdCount++;
    if (createdCount % 50 === 0) {
      console.log(`${createdCount} participantes criados...`);
    }
  }

  console.log(`\nSucesso! População concluída.`);
  console.log(`Total de participantes criados: ${createdCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

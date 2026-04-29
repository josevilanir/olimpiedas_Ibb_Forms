/**
 * Script de Limpeza de Modalidades Genéricas
 * ------------------------------------------
 * Remove do banco de dados as 13 modalidades que NÃO estão na lista
 * aprovada pelo cliente. Antes de deletar, exibe um relatório com
 * as inscrições vinculadas (se houver).
 *
 * Uso:
 *   npx ts-node --project tsconfig.seed.json scripts/cleanup-modalidades.ts
 *
 * Flags:
 *   --dry-run   Apenas mostra o que seria deletado, sem alterar o banco.
 *   --force     Executa a exclusão sem pedir confirmação.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

// ── Modalidades que o cliente aprovou (ficam no banco) ──────────────
const APPROVED_MODALITIES = [
  "Corrida Longa (5km)",
  "Corrida Curta Adulta (tiros de 100m, 150m e 200m)",
  "Corrida Curta Pré Teens (tiros de 100m e 150m)",
  "Corrida Curta Kids (tiros de 10m, 20m e 30m)",
  "Caminhada (2,5km)",
  "Futsal",
  "Futsal Pré Teens",
  "Volei de Quadra",
  "Queimada",
  "Tenis de Mesa",
  "Circuito Adulto (corrida de obstáculos)",
  "Circuito Kids (corrida de obstáculos)",
  "Natação",
  "Basquete",
  "E-Sports (FIFA)",
  "E-Sports (Counter-Strike [CS])",
  "E-Sports (League of Legends [Lol])",
  "Treino Funcional (não é competição)",
];

// ── Flags ───────────────────────────────────────────────────────────
const isDryRun = process.argv.includes("--dry-run");
const isForce = process.argv.includes("--force");

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  LIMPEZA DE MODALIDADES — Olimpíadas IBB");
  console.log("═══════════════════════════════════════════════════════\n");

  if (isDryRun) {
    console.log("⚠️  MODO DRY-RUN: nenhuma alteração será feita no banco.\n");
  }

  // 1. Buscar todas as modalidades do banco
  const allModalities = await prisma.modality.findMany({
    include: {
      subscriptions: {
        select: { id: true, participant: { select: { fullName: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log(`📋 Total de modalidades no banco: ${allModalities.length}\n`);

  // 2. Separar aprovadas × a serem removidas
  const toRemove = allModalities.filter(
    (m) => !APPROVED_MODALITIES.includes(m.name)
  );
  const approved = allModalities.filter((m) =>
    APPROVED_MODALITIES.includes(m.name)
  );

  // 3. Relatório das aprovadas
  console.log("✅ MODALIDADES APROVADAS (permanecem no banco):");
  console.log("───────────────────────────────────────────────");
  for (const m of approved) {
    const subs = m.subscriptions.length;
    console.log(`   • ${m.name} (${subs} inscrições)`);
  }
  console.log(`   Total: ${approved.length} modalidades\n`);

  // 4. Relatório das que serão removidas
  if (toRemove.length === 0) {
    console.log("🎉 Nenhuma modalidade para remover — banco já está limpo!");
    return;
  }

  let totalSubscriptions = 0;

  console.log("❌ MODALIDADES A SEREM REMOVIDAS:");
  console.log("───────────────────────────────────────────────");
  for (const m of toRemove) {
    const subs = m.subscriptions.length;
    totalSubscriptions += subs;
    console.log(`   • ${m.name} (id: ${m.id})`);
    if (subs > 0) {
      console.log(`     ⚠️  ${subs} inscrição(ões) vinculada(s):`);
      for (const s of m.subscriptions) {
        console.log(`        - ${s.participant.fullName} (sub: ${s.id})`);
      }
    }
  }
  console.log(`   Total: ${toRemove.length} modalidades | ${totalSubscriptions} inscrições vinculadas\n`);

  if (totalSubscriptions > 0) {
    console.log("⚠️  ATENÇÃO: Existem inscrições vinculadas!");
    console.log("   O schema usa onDelete: Cascade, então as inscrições");
    console.log("   serão deletadas automaticamente junto com a modalidade.\n");
  }

  // 5. Dry-run para aqui
  if (isDryRun) {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  DRY-RUN finalizado. Nenhum dado foi alterado.");
    console.log("  Remova --dry-run para executar a limpeza.");
    console.log("═══════════════════════════════════════════════════════");
    return;
  }

  // 6. Confirmação (skip se --force)
  if (!isForce) {
    console.log("⏳ Adicione --force para confirmar a exclusão.");
    console.log("   Comando: npx ts-node --project tsconfig.seed.json scripts/cleanup-modalidades.ts --force");
    return;
  }

  // 7. Executar exclusão
  console.log("🗑️  Executando exclusão...\n");

  for (const m of toRemove) {
    await prisma.modality.delete({ where: { id: m.id } });
    console.log(`   ✔ Deletada: ${m.name}`);
  }

  // 8. Validação final
  const remaining = await prisma.modality.count();
  console.log(`\n✅ Limpeza concluída! Modalidades restantes no banco: ${remaining}`);

  if (remaining === APPROVED_MODALITIES.length) {
    console.log("🎉 Banco bate exatamente com a lista do cliente (18 modalidades).");
  } else {
    console.log(`⚠️  Esperado: ${APPROVED_MODALITIES.length} | Encontrado: ${remaining}`);
    console.log("   Verifique manualmente se houve alguma divergência.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a limpeza:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import ExcelJS from "exceljs";
import { prisma } from "../lib/prisma";

function calcAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export async function exportParticipantsToExcel(modalityId?: string): Promise<ExcelJS.Buffer> {
  const modalities = await prisma.modality.findMany({
    where: modalityId ? { id: modalityId } : undefined,
    include: {
      subscriptions: {
        include: { participant: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Olimpíadas IBB";
  workbook.created = new Date();

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A56DB" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    },
  };

  for (const modality of modalities) {
    const sheetName = modality.name.slice(0, 31);
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = [
      { header: "Nome completo", key: "fullName", width: 32 },
      { header: "Responsável", key: "parentName", width: 25 },
      { header: "Idade", key: "age", width: 8 },
      { header: "Sexo", key: "gender", width: 12 },
      { header: "WhatsApp", key: "whatsapp", width: 18 },
      { header: "Membro IBB", key: "isMember", width: 14 },
      { header: "Inf. Saúde", key: "healthIssues", width: 35 },
      { header: "Data Inscrição", key: "createdAt", width: 18 },
    ];

    sheet.getRow(1).eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });
    sheet.getRow(1).height = 20;

    for (const sub of modality.subscriptions) {
      const p = sub.participant;
      sheet.addRow({
        fullName: p.fullName,
        parentName: p.parentName ?? "—",
        age: calcAge(new Date(p.birthDate)),
        gender: p.gender === "MASCULINO" ? "Masculino" : "Feminino",
        whatsapp: p.whatsapp,
        isMember: p.isMember,
        healthIssues: p.healthIssues ?? "—",
        createdAt: new Date(p.createdAt).toLocaleString("pt-BR"),
      });
    }

    // Zebra rows
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "FFF9FAFB" : "FFFFFFFF" },
        };
      });
    });
  }

  return workbook.xlsx.writeBuffer();
}

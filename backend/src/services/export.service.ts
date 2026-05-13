import ExcelJS from "exceljs";
import { findModalitiesForExport } from "../repositories/modality.repository";
import { findParticipantsForFinanceExport } from "../repositories/participant.repository";
import { calculateAge } from "../utils/age";

const HEADER_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, color: { argb: "FFFFFFFF" } },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A56DB" } },
  alignment: { horizontal: "center", vertical: "middle" },
  border: { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } },
};

function applyZebraRows(sheet: ExcelJS.Worksheet) {
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

export async function exportParticipantsToExcel(modalityId?: string): Promise<ExcelJS.Buffer> {
  const modalities = await findModalitiesForExport(modalityId);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Olimpíadas IBB";
  workbook.created = new Date();

  for (const modality of modalities) {
    // Yield between sheets so pending HTTP requests can be processed
    await new Promise<void>((resolve) => setImmediate(resolve));

    const sheetName = modality.name.replace(/[*?:/\\[\]]/g, "-").slice(0, 31).trim();
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = [
      { header: "Nome completo", key: "fullName", width: 32 },
      { header: "Responsável", key: "parentName", width: 25 },
      { header: "Idade", key: "age", width: 8 },
      { header: "Sexo", key: "gender", width: 12 },
      { header: "WhatsApp", key: "whatsapp", width: 18 },
      { header: "Membro IBB", key: "isMember", width: 14 },
      { header: "Status Pagto", key: "paymentStatus", width: 15 },
      { header: "Data Pagto", key: "paidAt", width: 18 },
      { header: "Inf. Saúde", key: "healthIssues", width: 35 },
      { header: "Data Inscrição", key: "createdAt", width: 18 },
    ];

    sheet.getRow(1).eachCell((cell) => { Object.assign(cell, HEADER_STYLE); });
    sheet.getRow(1).height = 20;

    for (const sub of modality.subscriptions) {
      const p = sub.participant;
      sheet.addRow({
        fullName: p.fullName,
        parentName: p.parentName ?? "—",
        age: calculateAge(new Date(p.birthDate)),
        gender: p.gender === "MASCULINO" ? "Masculino" : "Feminino",
        whatsapp: p.whatsapp,
        isMember: p.isMember,
        paymentStatus: p.paymentStatus,
        paidAt: p.paidAt ? new Date(p.paidAt).toLocaleString("pt-BR") : "—",
        healthIssues: p.healthIssues ?? "—",
        createdAt: new Date(p.createdAt).toLocaleString("pt-BR"),
      });
    }

    applyZebraRows(sheet);
  }

  return workbook.xlsx.writeBuffer();
}

export async function exportFinanceToExcel(): Promise<ExcelJS.Buffer> {
  const participants = await findParticipantsForFinanceExport();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Olimpíadas IBB";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Controle Financeiro");

  sheet.columns = [
    { header: "Nome completo", key: "fullName", width: 32 },
    { header: "Vínculo", key: "isMember", width: 14 },
    { header: "Idade", key: "age", width: 8 },
    { header: "Status Pagamento", key: "paymentStatus", width: 18 },
  ];

  sheet.getRow(1).eachCell((cell) => { Object.assign(cell, HEADER_STYLE); });
  sheet.getRow(1).height = 20;

  const FEE = 15.09;
  let confirmedCount = 0;

  // Yield before the row-building loop so concurrent requests are not stalled
  await new Promise<void>((resolve) => setImmediate(resolve));

  for (const p of participants) {
    const age = calculateAge(new Date(p.birthDate));
    const isExempt = age <= 8;

    sheet.addRow({
      fullName: p.fullName,
      isMember: p.isMember,
      age,
      paymentStatus: p.paymentStatus,
    });

    if (p.paymentStatus === "PAGO" && !isExempt) {
      confirmedCount++;
    }
  }

  applyZebraRows(sheet);

  sheet.addRow({});
  const totalRevenue = (confirmedCount * FEE).toFixed(2);
  const summaryRow = sheet.addRow({
    fullName: `R$ ${FEE} × ${confirmedCount} pagamentos confirmados = R$ ${totalRevenue}`,
  });
  summaryRow.font = { bold: true, size: 12 };
  summaryRow.getCell(1).alignment = { horizontal: "left" };

  return workbook.xlsx.writeBuffer();
}

import { jsPDF } from "jspdf";
import type { Participant } from "../types";

export function generateComprovantePdf(participant: Participant) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [26, 86, 219];
  const grayDark: [number, number, number] = [31, 41, 55];
  const grayMid: [number, number, number] = [107, 114, 128];

  // Header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Olimpíadas IBB", 20, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Comprovante de Inscrição", 20, 30);

  // ID
  doc.setTextColor(...grayMid);
  doc.setFontSize(9);
  doc.text(`ID: ${participant.id}`, 190, 8, { align: "right" });

  let y = 55;

  function section(title: string) {
    doc.setFillColor(240, 244, 255);
    doc.roundedRect(15, y - 6, 180, 10, 2, 2, "F");
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, 20, y);
    y += 12;
  }

  function field(label: string, value: string) {
    doc.setTextColor(...grayMid);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${label}:`, 20, y);
    doc.setTextColor(...grayDark);
    doc.setFont("helvetica", "bold");
    doc.text(value, 70, y);
    y += 8;
  }

  // Dados pessoais
  section("DADOS DO PARTICIPANTE");
  field("Nome", participant.fullName);
  if (participant.parentName) field("Responsável", participant.parentName);
  field("Nascimento", new Date(participant.birthDate).toLocaleDateString("pt-BR"));
  field("WhatsApp", participant.whatsapp);
  field("Sexo", participant.gender === "MASCULINO" ? "Masculino" : "Feminino");
  field("Vínculo IBB", participant.isMember);
  if (participant.healthIssues) field("Inf. Saúde", participant.healthIssues);

  y += 4;

  // Modalidades
  section("MODALIDADES INSCRITAS");
  for (const sub of participant.subscriptions) {
    doc.setTextColor(...grayDark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setFillColor(...primaryColor);
    doc.circle(23, y - 2, 2, "F");
    doc.text(sub.modality.name, 28, y);
    doc.setTextColor(...grayMid);
    doc.setFontSize(8);
    doc.text(`Coord: ${sub.modality.coordinatorName}`, 28, y + 5);
    y += 14;
  }

  y += 4;

  // Avisos
  section("INFORMAÇÕES DE PAGAMENTO");
  doc.setTextColor(...grayDark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const avisos = [
    "• Taxa de inscrição: R$ 15,09 por pessoa (isento até 8 anos).",
    "• Pagamento via PIX. Envie o comprovante pelo WhatsApp ao coordenador.",
    "• A camiseta oficial não está inclusa na taxa.",
  ];
  for (const aviso of avisos) {
    doc.text(aviso, 20, y);
    y += 7;
  }

  y = 260;
  doc.setFillColor(240, 244, 255);
  doc.roundedRect(15, y - 8, 180, 16, 3, 3, "F");
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DÚVIDAS? FALE COM SAMUCA PELO WHATSAPP: (84) 99921-5999", 105, y, { align: "center" });

  // Footer
  y = 280;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 6;
  doc.setTextColor(...grayMid);
  doc.setFontSize(8);
  doc.text(
    `Inscrição registrada em ${new Date(participant.createdAt).toLocaleString("pt-BR")}`,
    105,
    y,
    { align: "center" }
  );

  doc.save(`comprovante_${participant.fullName.replace(/\s+/g, "_")}.pdf`);
}

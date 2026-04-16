import PDFDocument from "pdfkit";
import { Response } from "express";

export const generateOrdemPDF = (ordem: any, res: Response) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=ordem-${ordem.id}.pdf`,
  );

  doc.pipe(res);

  const formatCurrency = (value: number) =>
    `R$ ${Number(value || 0).toFixed(2)}`;
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR")}`;
  };

  // HEADER
  doc.rect(40, 30, 515, 65).fill("#111827");
  doc
    .fillColor("#FFFFFF")
    .fontSize(18)
    .font("Helvetica-Bold")
    .text(ordem.oficina_nome || "MOTRIX AUTO CENTER", 40, 42, {
      width: 515,
      align: "center",
    });
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Tel: ${ordem.oficina_telefone || "N/A"} | Mecânico: ${ordem.mecanico_nome || "N/A"}`,
      { align: "center" },
    );
  if (ordem.oficina_endereco && ordem.oficina_endereco !== "N/A") {
    doc.text(`Endereço: ${ordem.oficina_endereco}`, { align: "center" });
  }

  doc.fillColor("#000000").moveDown(2.5);

  // TÍTULO
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("ORDEM DE SERVIÇO", { align: "center" });
  doc
    .fontSize(12)
    .fillColor("#2563EB")
    .text(`Nº ${String(ordem.id).padStart(6, "0")}`, { align: "center" });
  doc.fillColor("#000000").moveDown(0.8);

  const formatDateOnly = (value: any): string => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    // Normaliza para evitar problema de fuso: usa UTC
    const utc = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return utc.toLocaleDateString("pt-BR");
  };

  // INFO GERAL — linha 1: abertura, geração e status
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Abertura: ${formatDate(ordem.data)} | Gerado em: ${formatDate(new Date().toISOString())}`,
    );

  // STATUS em destaque
  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .text(`Status: ${ordem.status}`, { continued: !!ordem.data_prevista });
  if (ordem.data_prevista) {
    doc
      .font("Helvetica")
      .text(
        `   |   Previsão de conclusão: ${formatDateOnly(ordem.data_prevista)}`,
      );
  } else {
    doc.moveDown(0);
  }
  doc.moveDown(0.5);

  const sectionTitle = (title: string) => {
    doc.fontSize(10).font("Helvetica-Bold").text(title);
    doc
      .moveTo(40, doc.y + 1)
      .lineTo(555, doc.y + 1)
      .stroke();
    doc.moveDown(0.3);
  };

  // CLIENTE
  sectionTitle("DADOS DO CLIENTE");
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Nome: ${ordem.cliente_nome || "N/A"} | Telefone: ${ordem.cliente_telefone || "N/A"}${ordem.cliente_cpf ? " | CPF: " + ordem.cliente_cpf : ""}`,
    );
  if (ordem.cliente_endereco) doc.text(`Endereço: ${ordem.cliente_endereco}`);
  doc.moveDown(0.5);

  // VEÍCULO
  sectionTitle("DADOS DO VEÍCULO");
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Placa: ${ordem.veiculo_placa || "N/A"} | Modelo: ${ordem.veiculo_modelo || "N/A"}${ordem.veiculo_chassi ? " | Chassi: " + ordem.veiculo_chassi : ""}${ordem.veiculo_cor ? " | Cor: " + ordem.veiculo_cor : ""} | KM: ${ordem.km_atual || "0"}`,
    );
  doc.moveDown(0.5);

  // DESCRIÇÃO
  sectionTitle("DESCRIÇÃO DO PROBLEMA");
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(ordem.descricao_problema || "-", { align: "justify" });
  if (ordem.observacoes)
    doc.text(`Obs: ${ordem.observacoes}`, { align: "justify" });
  doc.moveDown(0.5);

  // CANCELAMENTO
  if (ordem.motivo_cancelamento) {
    doc.moveDown(0.5);
    const cancelY = doc.y;
    doc
      .rect(40, cancelY, 515, doc.currentLineHeight() * 3 + 14)
      .fill("#FEE2E2");
    doc
      .fillColor("#991B1B")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("MOTIVO DO CANCELAMENTO", 50, cancelY + 5);
    doc
      .fontSize(8)
      .font("Helvetica")
      .text(ordem.motivo_cancelamento, 50, doc.y + 2, { width: 495 });
    doc.fillColor("#000000").moveDown(1.5);
  }

  // PEÇAS
  if (ordem.pecas?.length) {
    sectionTitle("PEÇAS UTILIZADAS");
    ordem.pecas.forEach((peca: any) => {
      doc
        .fontSize(8)
        .text(`${peca.nome}`, { continued: true })
        .text(`${formatCurrency(peca.valor)}`, { align: "right" });
    });
    doc.moveDown(0.5);
  }

  // MÃO DE OBRA
  if (ordem.maoObra?.length) {
    sectionTitle("MÃO DE OBRA");
    ordem.maoObra.forEach((mo: any) => {
      doc
        .fontSize(8)
        .text(`${mo.descricao}`, { continued: true })
        .text(`${formatCurrency(mo.valor)}`, { align: "right" });
    });
    doc.moveDown(0.5);
  }

  // TOTAL
  doc.moveDown(1);
  const totalBoxY = doc.y;
  doc.rect(350, totalBoxY, 205, 35).fill("#F3F4F6");
  doc
    .fillColor("#000000")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`VALOR TOTAL: ${formatCurrency(ordem.total)}`, 350, totalBoxY + 10, {
      width: 205,
      align: "center",
    });

  // ASSINATURAS - sempre no final da página
  const signatureY = 750;
  doc.moveTo(60, signatureY).lineTo(240, signatureY).stroke();
  doc.moveTo(360, signatureY).lineTo(540, signatureY).stroke();
  doc.fontSize(8).font("Helvetica");
  doc.text(ordem.cliente_nome || "", 60, signatureY + 5, {
    width: 180,
    align: "center",
  });
  doc.text("Assinatura do Cliente", 60, signatureY + 16, {
    width: 180,
    align: "center",
  });
  doc.text(ordem.mecanico_nome || "", 360, signatureY + 5, {
    width: 180,
    align: "center",
  });
  doc.text("Assinatura do Mecânico", 360, signatureY + 16, {
    width: 180,
    align: "center",
  });

  doc.end();
};

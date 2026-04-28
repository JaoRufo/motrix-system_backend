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

  const formatDateOnly = (value: any): string => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const utc = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return utc.toLocaleDateString("pt-BR");
  };

  const pageBottom = doc.page.height - 40;

  const ensureSpace = (space: number) => {
    if (doc.y + space > pageBottom) {
      doc.addPage();
    }
  };

  const sectionTitle = (title: string) => {
    ensureSpace(20);
    doc.fontSize(10).font("Helvetica-Bold").text(title, 40);
    doc
      .moveTo(40, doc.y + 2)
      .lineTo(555, doc.y + 2)
      .strokeColor("#E5E7EB")
      .stroke();
    doc.moveDown(0.6);
    doc.font("Helvetica");
  };

  const drawTable = (items: any[], columns: any[]) => {
    const drawHeader = (y: number) => {
      doc.font("Helvetica-Bold").fontSize(8);
      columns.forEach((col: any) => {
        doc.text(col.header, col.x, y, { width: col.width });
      });
      const lineY = y + 15;
      doc.moveTo(40, lineY).lineTo(555, lineY).strokeColor("#000").stroke();
      return lineY;
    };

    if (doc.y + 30 > pageBottom) {
      doc.addPage();
    }

    let y = drawHeader(doc.y);

    doc.font("Helvetica").fontSize(8);

    let isGray = false;

    items.forEach((item: any) => {
      let rowHeight = 0;

      doc.font("Helvetica").fontSize(8);
      columns.forEach((col: any) => {
        const h = doc.heightOfString(col.render(item), { width: col.width });
        if (h > rowHeight) rowHeight = h;
      });

      const rowPadding = 6;
      const rowTotalHeight = rowHeight + rowPadding * 2;

      if (y + rowTotalHeight > pageBottom) {
        doc.addPage();
        y = drawHeader(40);
        doc.font("Helvetica").fontSize(8);
        isGray = false;
      }

      const rowTop = y;

      if (isGray) {
        doc.rect(40, rowTop, 515, rowTotalHeight).fill("#F9FAFB");
        doc.fillColor("#000");
      }

      columns.forEach((col: any) => {
        const text = col.render(item);
        const textH = doc.heightOfString(text, { width: col.width });
        const offsetY = (rowTotalHeight - textH) / 2;
        doc.text(text, col.x, rowTop + offsetY, { width: col.width });
      });

      y += rowTotalHeight;
      isGray = !isGray;
    });

    doc.y = y;
  };

  // HEADER
  doc.rect(40, 30, 515, 65).fill("#111827");

  doc
    .fillColor("#FFF")
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

  doc.fillColor("#000").moveDown(2.5);

  // TÍTULO
  doc.fontSize(14).font("Helvetica-Bold").text("ORDEM DE SERVIÇO", {
    align: "center",
  });

  doc
    .fontSize(12)
    .fillColor("#2563EB")
    .text(`Nº ${String(ordem.id).padStart(6, "0")}`, {
      align: "center",
    });

  doc.fillColor("#000").moveDown(1);

  // INFO
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Abertura: ${formatDate(ordem.data)} | Gerado em: ${formatDate(
        new Date().toISOString(),
      )}`,
    );

  const statusColors: Record<string, string> = {
    Aberta: "#2563EB",
    "Em Andamento": "#D97706",
    "Aguardando Orçamento": "#7C3AED",
    Finalizada: "#16A34A",
    Cancelada: "#DC2626",
  };
  const statusColor = statusColors[ordem.status] || "#000";

  doc
    .font("Helvetica-Bold")
    .fillColor(statusColor)
    .text(`Status: ${ordem.status}`, {
      continued: !!ordem.data_prevista,
    });

  if (ordem.data_prevista) {
    doc
      .font("Helvetica")
      .fillColor("#000")
      .text(`   |   Previsão: ${formatDateOnly(ordem.data_prevista)}`);
  } else {
    doc.fillColor("#000");
  }

  doc.moveDown(0.8);

  // CLIENTE
  sectionTitle("DADOS DO CLIENTE");
  doc.text(
    `Nome: ${ordem.cliente_nome || "N/A"} | Telefone: ${
      ordem.cliente_telefone || "N/A"
    }${ordem.cliente_cpf ? " | CPF: " + ordem.cliente_cpf : ""}`,
  );

  if (ordem.cliente_endereco) doc.text(`Endereço: ${ordem.cliente_endereco}`);

  doc.moveDown(0.8);

  // VEÍCULO
  sectionTitle("DADOS DO VEÍCULO");
  doc.text(
    `Placa: ${ordem.veiculo_placa || "N/A"} | Modelo: ${
      ordem.veiculo_modelo || "N/A"
    }${ordem.veiculo_chassi ? " | Chassi: " + ordem.veiculo_chassi : ""}${
      ordem.veiculo_cor ? " | Cor: " + ordem.veiculo_cor : ""
    } | KM: ${ordem.km_atual || "0"}`,
  );

  doc.moveDown(0.8);

  // DESCRIÇÃO
  sectionTitle("DESCRIÇÃO DO PROBLEMA");
  doc.text(ordem.descricao_problema || "-", { align: "justify" });

  if (ordem.observacoes)
    doc.text(`Obs: ${ordem.observacoes}`, { align: "justify" });

  doc.moveDown(0.8);

  // CANCELAMENTO
  if (ordem.motivo_cancelamento) {
    ensureSpace(70);

    const y = doc.y;

    doc.rect(40, y, 515, 60).fill("#FEE2E2");

    doc
      .fillColor("#991B1B")
      .font("Helvetica-Bold")
      .text("MOTIVO DO CANCELAMENTO", 50, y + 8);

    doc.font("Helvetica").text(ordem.motivo_cancelamento, 50, y + 22, {
      width: 495,
    });

    doc.fillColor("#000").moveDown(3);
  }

  // PEÇAS
  if (ordem.pecas?.length) {
    sectionTitle("PEÇAS UTILIZADAS");

    drawTable(ordem.pecas, [
      {
        header: "Descrição",
        x: 40,
        width: 350,
        render: (p: any) => p.nome,
      },
      {
        header: "Valor",
        x: 400,
        width: 150,
        render: (p: any) => formatCurrency(p.valor),
      },
    ]);

    doc.moveDown(0.8);
  }

  // MÃO DE OBRA
  if (ordem.maoObra?.length) {
    sectionTitle("MÃO DE OBRA");

    drawTable(ordem.maoObra, [
      {
        header: "Serviço",
        x: 40,
        width: 350,
        render: (m: any) => m.descricao,
      },
      {
        header: "Valor",
        x: 400,
        width: 150,
        render: (m: any) => formatCurrency(m.valor),
      },
    ]);

    doc.moveDown(0.8);
  }

  // TOTAL
  ensureSpace(60);

  const totalY = doc.y;

  doc.rect(350, totalY, 205, 40).fill("#E0E7FF");

  doc
    .fillColor("#000")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`TOTAL: ${formatCurrency(ordem.total)}`, 350, totalY + 12, {
      width: 205,
      align: "center",
    });

  doc.moveDown(2);

  // ASSINATURAS
  const signatureBlockHeight = 80;
  if (doc.y + signatureBlockHeight > pageBottom) {
    doc.addPage();
  }

  const signatureY = doc.y + 30;

  doc.lineWidth(2).strokeColor("#000");
  doc.moveTo(60, signatureY).lineTo(240, signatureY).stroke();
  doc.moveTo(360, signatureY).lineTo(540, signatureY).stroke();
  doc.lineWidth(1).strokeColor("#000");

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

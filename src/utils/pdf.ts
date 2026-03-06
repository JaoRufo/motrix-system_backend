import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateOrdemPDF = (ordem: any, res: Response) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ordem-${ordem.id}.pdf`);

  doc.pipe(res);

  const formatCurrency = (value: number) =>
    `R$ ${Number(value || 0).toFixed(2)}`;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR')}`;
  };

  // =========================
  // HEADER
  // =========================
  doc.rect(50, 40, 495, 70).fill('#111827');

  doc
    .fillColor('#FFFFFF')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(ordem.oficina_nome || 'MOTRIX AUTO CENTER', 50, 60, {
      width: 495,
      align: 'center',
    });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      `CNPJ: ${ordem.oficina_cnpj || 'N/A'} | Tel: ${ordem.oficina_telefone || 'N/A'
      }`,
      { align: 'center' }
    );

  doc.fillColor('#000000');
  doc.moveDown(4);

  // =========================
  // TÍTULO
  // =========================
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('ORDEM DE SERVIÇO', { align: 'center' });

  doc
    .fontSize(14)
    .fillColor('#2563EB')
    .text(`Nº ${String(ordem.id).padStart(6, '0')}`, {
      align: 'center',
    });

  doc.fillColor('#000000');
  doc.moveDown();

  // =========================
  // INFO GERAL
  // =========================
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Abertura: ${formatDate(ordem.data)}`)
    .text(`Status: ${ordem.status}`)
    .text(`Gerado em: ${formatDate(new Date().toISOString())}`);

  doc.moveDown();

  const sectionTitle = (title: string) => {
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text(title);
    doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
    doc.moveDown();
  };

  // =========================
  // CLIENTE
  // =========================
  sectionTitle('DADOS DO CLIENTE');
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Nome: ${ordem.cliente_nome || 'N/A'}`)
    .text(`Telefone: ${ordem.cliente_telefone || 'N/A'}`);
  if (ordem.cliente_cpf) doc.text(`CPF: ${ordem.cliente_cpf}`);
  if (ordem.cliente_endereco) doc.text(`Endereço: ${ordem.cliente_endereco}`);

  // =========================
  // VEÍCULO
  // =========================
  sectionTitle('DADOS DO VEÍCULO');
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Placa: ${ordem.veiculo_placa || 'N/A'}`)
    .text(`Modelo: ${ordem.veiculo_modelo || 'N/A'}`);
  if (ordem.veiculo_chassi) doc.text(`Chassi: ${ordem.veiculo_chassi}`);
  if (ordem.veiculo_cor) doc.text(`Cor: ${ordem.veiculo_cor}`);
  doc.text(`KM Atual: ${ordem.km_atual || '0'}`);

  // =========================
  // DESCRIÇÃO
  // =========================
  sectionTitle('DESCRIÇÃO DO PROBLEMA');
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(ordem.descricao_problema || '-', { align: 'justify' });

  if (ordem.observacoes) {
    doc.moveDown(0.5);
    doc.text(`Observações: ${ordem.observacoes}`, { align: 'justify' });
  }

  // =========================
  // PEÇAS
  // =========================
  if (ordem.pecas?.length) {
    sectionTitle('PEÇAS UTILIZADAS');
    ordem.pecas.forEach((peca: any) => {
      doc
        .fontSize(10)
        .text(`${peca.nome}`, { continued: true })
        .text(`${formatCurrency(peca.valor)}`, { align: 'right' });
    });
  }

  // =========================
  // MÃO DE OBRA
  // =========================
  if (ordem.maoObra?.length) {
    sectionTitle('MÃO DE OBRA');
    ordem.maoObra.forEach((mo: any) => {
      doc
        .fontSize(10)
        .text(`${mo.descricao}`, { continued: true })
        .text(`${formatCurrency(mo.valor)}`, { align: 'right' });
    });
  }

  // =========================
  // TOTAL (CORRIGIDO)
  // =========================
  doc.moveDown(2);

  const totalBoxY = doc.y;

  doc
    .rect(300, totalBoxY, 245, 45)
    .fill('#F3F4F6');

  doc
    .fillColor('#000000')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(
      `VALOR TOTAL: ${formatCurrency(ordem.total)}`,
      300,
      totalBoxY + 15,
      { width: 245, align: 'center' }
    );

  doc.moveDown(5);

  // =========================
  // ASSINATURAS
  // =========================
  const signatureY = doc.y;

  // Linha cliente
  doc.moveTo(60, signatureY).lineTo(250, signatureY).stroke();

  // Linha mecânico
  doc.moveTo(330, signatureY).lineTo(520, signatureY).stroke();

  doc.fontSize(10).font('Helvetica');

  // Nome abaixo da linha cliente

  doc.text('Assinatura do Cliente', 60, signatureY + 20, {
    width: 190,
    align: 'center',
  });
  doc.text(ordem.cliente_nome || '', 60, signatureY + 5, {
    width: 190,
    align: 'center',
  });

  doc.text('Assinatura do Mecânico', 330, signatureY + 20, {
    width: 190,
    align: 'center',
  });

  doc.end();
};
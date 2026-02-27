import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateOrdemPDF = (ordem: any, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ordem-${ordem.id}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text('ORDEM DE SERVIÇO', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Nº: ${ordem.id}`, { align: 'right' });
  doc.text(`Data: ${new Date(ordem.data).toLocaleDateString('pt-BR')}`, { align: 'right' });
  doc.text(`Status: ${ordem.status}`, { align: 'right' });
  doc.moveDown();

  doc.fontSize(14).text('DADOS DO CLIENTE', { underline: true });
  doc.fontSize(10).text(`Nome: ${ordem.cliente_nome || 'N/A'}`);
  doc.text(`Telefone: ${ordem.cliente_telefone || 'N/A'}`);
  doc.moveDown();

  doc.fontSize(14).text('DADOS DO VEÍCULO', { underline: true });
  doc.fontSize(10).text(`Placa: ${ordem.veiculo_placa || 'N/A'}`);
  doc.text(`Modelo: ${ordem.veiculo_modelo || ordem.veiculo_descricao || 'N/A'}`);
  doc.text(`KM Atual: ${ordem.km_atual}`);
  doc.moveDown();

  doc.fontSize(14).text('DESCRIÇÃO DO PROBLEMA', { underline: true });
  doc.fontSize(10).text(ordem.descricao_problema);
  if (ordem.observacoes) {
    doc.text(`Observações: ${ordem.observacoes}`);
  }
  doc.moveDown();

  if (ordem.pecas && ordem.pecas.length > 0) {
    doc.fontSize(14).text('PEÇAS', { underline: true });
    ordem.pecas.forEach((peca: any) => {
      doc.fontSize(10).text(`${peca.nome} - R$ ${Number(peca.valor).toFixed(2)}`);
    });
    doc.moveDown();
  }

  if (ordem.maoObra && ordem.maoObra.length > 0) {
    doc.fontSize(14).text('MÃO DE OBRA', { underline: true });
    ordem.maoObra.forEach((mo: any) => {
      doc.fontSize(10).text(`${mo.descricao} - R$ ${Number(mo.valor).toFixed(2)}`);
    });
    doc.moveDown();
  }

  doc.fontSize(16).text(`TOTAL: R$ ${Number(ordem.total).toFixed(2)}`, { align: 'right' });

  if (ordem.motivo_cancelamento) {
    doc.moveDown();
    doc.fontSize(12).text(`Motivo Cancelamento: ${ordem.motivo_cancelamento}`);
  }

  doc.end();
};

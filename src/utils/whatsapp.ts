export function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatarMoeda(valor: number): string {
  const numero = Number(valor)
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${numero}`;
}

export function gerarMensagemVeiculoPronto(
  nome: string,
  veiculo: string,
  placa: string,
  total: number,
  endereco: string,
): string {
  return `${getSaudacao()} ${nome}, seu *${veiculo} — ${placa}* já está pronto! \nVocê já pode vir retirá-lo aqui na oficina no endereço *${endereco}.* \nO total dos serviços é de *${formatarMoeda(total)}.* \nObrigado!`;
}

interface ItemOrcamento {
  nome?: string;
  descricao?: string;
  valor: number;
}

export function gerarMensagemOrcamento(
  nome: string,
  veiculo: string,
  placa: string,
  descricaoOS: string,
  pecas: ItemOrcamento[],
  maoObra: ItemOrcamento[],
  total: number,
): string {
  const linhas: string[] = [
    `Olá ${nome}, identificamos o problema do seu *${veiculo} — ${placa}*.`,

    ``,
    `*Problema relatado:*`,
    descricaoOS,
  ];

  if (pecas.length > 0) {
    linhas.push(``, `*Peças necessárias:*`);
    pecas.forEach((p) =>
      linhas.push(`• ${p.nome} — ${formatarMoeda(p.valor)}`),
    );
  }

  if (maoObra.length > 0) {
    linhas.push(``, `*Mão de obra:*`);
    maoObra.forEach((m) =>
      linhas.push(`• ${m.descricao} — ${formatarMoeda(m.valor)}`),
    );
  }

  linhas.push(
    ``,
    `*Total: ${formatarMoeda(total)}*`,
    ``,
    `Podemos prosseguir com o serviço?`,
  );

  return linhas.join("\n");
}

export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
}

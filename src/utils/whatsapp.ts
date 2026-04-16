export function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatarMoeda(valor: number): string {
  const numero = Number(valor).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${numero}`;
}

export function gerarMensagemWhatsApp(
  nome: string,
  total: number,
  endereco: string,
): string {
  return `${getSaudacao()} ${nome}, seu veículo já está pronto!\nVocê já pode vir retirá-lo aqui na oficina no endereço ${endereco}.\nO total dos serviços é de ${formatarMoeda(total)}.\nObrigado!`;
}

export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const numero = telefone.replace(/\D/g, "");
  return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
}

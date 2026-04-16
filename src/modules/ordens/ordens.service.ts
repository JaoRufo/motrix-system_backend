import {
  ordemRepository,
  OrdemServico,
  OrdemPeca,
  OrdemMaoObra,
} from "./ordens.repository";
import { pool } from "../../config/database";
import { gerarMensagemWhatsApp, gerarLinkWhatsApp } from "../../utils/whatsapp";

const STATUS_VALIDOS = [
  "Aberta",
  "Em Andamento",
  "Aguardando Orçamento",
  "Finalizada",
  "Cancelada",
];

export const ordemService = {
  async getAll(page: number = 1, limit: number = 10) {
    const result = await ordemRepository.findAll(page, limit);
    const ordensComItens = await Promise.all(
      result.data.map(async (ordem) => {
        const pecas = await ordemRepository.findPecasByOrdemId(ordem.id);
        const maoObra = await ordemRepository.findMaoObraByOrdemId(ordem.id);
        return { ...ordem, pecas, maoObra };
      }),
    );
    return {
      data: ordensComItens,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  },

  async getById(id: number) {
    const ordem = await ordemRepository.findById(id);
    if (!ordem) {
      throw new Error("Ordem de serviço não encontrada");
    }
    const pecas = await ordemRepository.findPecasByOrdemId(id);
    const maoObra = await ordemRepository.findMaoObraByOrdemId(id);
    return { ...ordem, pecas, maoObra };
  },

  async getByPlaca(placa: string) {
    const ordens = await ordemRepository.findByPlaca(placa);
    const ordensComItens = await Promise.all(
      ordens.map(async (ordem) => {
        const pecas = await ordemRepository.findPecasByOrdemId(ordem.id);
        const maoObra = await ordemRepository.findMaoObraByOrdemId(ordem.id);
        return { ...ordem, pecas, maoObra };
      }),
    );
    return ordensComItens;
  },

  async create(data: {
    ordem: Omit<OrdemServico, "id" | "created_at" | "updated_at" | "total">;
    pecas: Omit<OrdemPeca, "id" | "ordem_id">[];
    maoObra: Omit<OrdemMaoObra, "id" | "ordem_id">[];
  }) {
    if (!STATUS_VALIDOS.includes(data.ordem.status)) {
      throw new Error("Status inválido");
    }

    if (data.ordem.status === "Cancelada" && !data.ordem.motivo_cancelamento) {
      throw new Error(
        "Motivo de cancelamento é obrigatório quando status é Cancelada",
      );
    }

    const result = await ordemRepository.createWithItens(
      data.ordem,
      data.pecas,
      data.maoObra,
    );
    return { ...result.ordem, pecas: result.pecas, maoObra: result.maoObra };
  },

  async update(
    id: number,
    data: {
      ordem: Partial<OrdemServico>;
      pecas?: Omit<OrdemPeca, "id" | "ordem_id">[];
      maoObra?: Omit<OrdemMaoObra, "id" | "ordem_id">[];
    },
  ) {
    const ordemExiste = await ordemRepository.findById(id);
    if (!ordemExiste) {
      throw new Error("Ordem de serviço não encontrada");
    }

    if (data.ordem.status && !STATUS_VALIDOS.includes(data.ordem.status)) {
      throw new Error("Status inválido");
    }

    if (data.ordem.status === "Cancelada" && !data.ordem.motivo_cancelamento) {
      throw new Error(
        "Motivo de cancelamento é obrigatório quando status é Cancelada",
      );
    }

    const result = await ordemRepository.updateWithItens(
      id,
      data.ordem,
      data.pecas,
      data.maoObra,
    );
    return { ...result.ordem, pecas: result.pecas, maoObra: result.maoObra };
  },

  async delete(id: number) {
    const deleted = await ordemRepository.delete(id);
    if (!deleted) {
      throw new Error("Ordem de serviço não encontrada");
    }
    return { message: "Ordem de serviço excluída com sucesso" };
  },

  async getLinkWhatsApp(
    id: number,
  ): Promise<{ link: string; mensagem: string }> {
    const ordem = await ordemRepository.findById(id);
    if (!ordem) throw new Error("Ordem de serviço não encontrada");
    if (ordem.status !== "Finalizada")
      throw new Error("A ordem ainda não foi finalizada");

    const [clienteResult, oficinaResult] = await Promise.all([
      pool.query("SELECT nome, telefone FROM clientes WHERE id = $1", [
        ordem.cliente_id,
      ]),
      pool.query("SELECT endereco FROM oficinas LIMIT 1"),
    ]);

    const cliente = clienteResult.rows[0];
    const oficina = oficinaResult.rows[0];

    if (!cliente) throw new Error("Cliente não encontrado");
    if (!cliente.telefone)
      throw new Error("Cliente não possui telefone cadastrado");
    if (!oficina?.endereco)
      throw new Error("Endereço da oficina não cadastrado");

    const mensagem = gerarMensagemWhatsApp(
      cliente.nome,
      ordem.total,
      oficina.endereco,
    );
    const link = gerarLinkWhatsApp(cliente.telefone, mensagem);

    return { link, mensagem };
  },
};

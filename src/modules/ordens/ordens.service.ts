import { ordemRepository, OrdemServico, OrdemPeca, OrdemMaoObra } from './ordens.repository';

const STATUS_VALIDOS = ['Aberta', 'Em Andamento', 'Aguardando Orçamento', 'Finalizada', 'Cancelada'];

export const ordemService = {
  async getAll() {
    const ordens = await ordemRepository.findAll();
    const ordensComItens = await Promise.all(
      ordens.map(async (ordem) => {
        const pecas = await ordemRepository.findPecasByOrdemId(ordem.id);
        const maoObra = await ordemRepository.findMaoObraByOrdemId(ordem.id);
        return { ...ordem, pecas, maoObra };
      })
    );
    return ordensComItens;
  },

  async getById(id: number) {
    const ordem = await ordemRepository.findById(id);
    if (!ordem) {
      throw new Error('Ordem de serviço não encontrada');
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
      })
    );
    return ordensComItens;
  },

  async create(data: {
    ordem: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at' | 'total'>;
    pecas: Omit<OrdemPeca, 'id' | 'ordem_id'>[];
    maoObra: Omit<OrdemMaoObra, 'id' | 'ordem_id'>[];
  }) {
    if (!STATUS_VALIDOS.includes(data.ordem.status)) {
      throw new Error('Status inválido');
    }

    if (data.ordem.status === 'Cancelada' && !data.ordem.motivo_cancelamento) {
      throw new Error('Motivo de cancelamento é obrigatório quando status é Cancelada');
    }

    const result = await ordemRepository.createWithItens(data.ordem, data.pecas, data.maoObra);
    return { ...result.ordem, pecas: result.pecas, maoObra: result.maoObra };
  },

  async update(
    id: number,
    data: {
      ordem: Partial<OrdemServico>;
      pecas?: Omit<OrdemPeca, 'id' | 'ordem_id'>[];
      maoObra?: Omit<OrdemMaoObra, 'id' | 'ordem_id'>[];
    }
  ) {
    const ordemExiste = await ordemRepository.findById(id);
    if (!ordemExiste) {
      throw new Error('Ordem de serviço não encontrada');
    }

    if (data.ordem.status && !STATUS_VALIDOS.includes(data.ordem.status)) {
      throw new Error('Status inválido');
    }

    if (data.ordem.status === 'Cancelada' && !data.ordem.motivo_cancelamento) {
      throw new Error('Motivo de cancelamento é obrigatório quando status é Cancelada');
    }

    const result = await ordemRepository.updateWithItens(id, data.ordem, data.pecas, data.maoObra);
    return { ...result.ordem, pecas: result.pecas, maoObra: result.maoObra };
  },

  async delete(id: number) {
    const deleted = await ordemRepository.delete(id);
    if (!deleted) {
      throw new Error('Ordem de serviço não encontrada');
    }
    return { message: 'Ordem de serviço excluída com sucesso' };
  }
};

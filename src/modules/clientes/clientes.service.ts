import { clienteRepository, Cliente, Veiculo } from './clientes.repository';

export const clienteService = {
  async getAll() {
    const clientes = await clienteRepository.findAll();
    const clientesComVeiculos = await Promise.all(
      clientes.map(async (cliente) => {
        const veiculos = await clienteRepository.findVeiculosByClienteId(cliente.id);
        return { ...cliente, veiculos };
      })
    );
    return clientesComVeiculos;
  },

  async getById(id: number) {
    const cliente = await clienteRepository.findById(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }
    const veiculos = await clienteRepository.findVeiculosByClienteId(id);
    return { ...cliente, veiculos };
  },

  async create(data: { cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>; veiculos: Omit<Veiculo, 'id' | 'cliente_id' | 'created_at' | 'updated_at'>[] }) {
    if (!data.veiculos || data.veiculos.length === 0) {
      throw new Error('Cliente deve ter pelo menos 1 veículo');
    }

    const result = await clienteRepository.createWithVeiculos(data.cliente, data.veiculos);
    return { ...result.cliente, veiculos: result.veiculos };
  },

  async update(id: number, data: Partial<Cliente>) {
    const clienteExiste = await clienteRepository.findById(id);
    if (!clienteExiste) {
      throw new Error('Cliente não encontrado');
    }

    const cliente = await clienteRepository.update(id, data);
    if (!cliente) {
      throw new Error('Erro ao atualizar cliente');
    }

    const veiculos = await clienteRepository.findVeiculosByClienteId(id);
    return { ...cliente, veiculos };
  },

  async delete(id: number) {
    const deleted = await clienteRepository.delete(id);
    if (!deleted) {
      throw new Error('Cliente não encontrado');
    }
    return { message: 'Cliente excluído com sucesso' };
  },

  async getHistorico(id: number) {
    const cliente = await clienteRepository.findById(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }
    return await clienteRepository.getHistorico(id);
  }
};

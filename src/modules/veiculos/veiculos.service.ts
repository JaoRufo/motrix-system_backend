import { veiculoRepository, Veiculo } from './veiculos.repository';

export const veiculoService = {
  async update(id: number, data: Partial<Veiculo>) {
    const veiculo = await veiculoRepository.findById(id);
    if (!veiculo) {
      throw new Error('Veículo não encontrado');
    }

    const veiculoAtualizado = await veiculoRepository.update(id, data);
    return veiculoAtualizado;
  },

  async delete(id: number) {
    const deleted = await veiculoRepository.delete(id);
    if (!deleted) {
      throw new Error('Veículo não encontrado');
    }
    return { message: 'Veículo excluído com sucesso' };
  }
};

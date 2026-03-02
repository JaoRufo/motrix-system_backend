import { oficinaRepository, Oficina } from './oficinas.repository';

export const oficinaService = {
  async get() {
    const oficina = await oficinaRepository.findFirst();
    if (!oficina) {
      throw new Error('Oficina não encontrada');
    }
    return oficina;
  },

  async update(id: number, data: Partial<Oficina>) {
    const oficina = await oficinaRepository.update(id, data);
    if (!oficina) {
      throw new Error('Erro ao atualizar oficina');
    }
    return oficina;
  }
};

import { clienteRepository, Cliente, Veiculo } from './clientes.repository';
import { veiculoRepository } from '../veiculos/veiculos.repository';
import { PoolClient } from 'pg';
import { pool } from '../../config/database';

export const clienteService = {
  async getAll(page: number = 1, limit: number = 10) {
    const result = await clienteRepository.findAll(page, limit);
    const clientesComVeiculos = await Promise.all(
      result.data.map(async (cliente) => {
        const veiculos = await clienteRepository.findVeiculosByClienteId(cliente.id);
        return { ...cliente, veiculos };
      })
    );
    return {
      data: clientesComVeiculos,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
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

  async update(id: number, data: { cliente?: Partial<Cliente>; veiculos?: Array<Partial<Veiculo> & { id?: number }> }) {
    const clienteExiste = await clienteRepository.findById(id);
    if (!clienteExiste) {
      throw new Error('Cliente não encontrado');
    }

    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');

      let cliente = clienteExiste;
      if (data.cliente) {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.cliente.nome !== undefined) {
          updates.push(`nome = $${paramCount++}`);
          values.push(data.cliente.nome);
        }
        if (data.cliente.cpf !== undefined) {
          updates.push(`cpf = $${paramCount++}`);
          values.push(data.cliente.cpf);
        }
        if (data.cliente.telefone !== undefined) {
          updates.push(`telefone = $${paramCount++}`);
          values.push(data.cliente.telefone);
        }
        if (data.cliente.email !== undefined) {
          updates.push(`email = $${paramCount++}`);
          values.push(data.cliente.email);
        }
        if (data.cliente.endereco !== undefined) {
          updates.push(`endereco = $${paramCount++}`);
          values.push(data.cliente.endereco);
        }

        if (updates.length > 0) {
          updates.push(`updated_at = NOW()`);
          values.push(id);
          const result = await client.query(
            `UPDATE clientes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
          );
          cliente = result.rows[0];
        }
      }

      if (data.veiculos && data.veiculos.length > 0) {
        for (const veiculo of data.veiculos) {
          if (veiculo.id) {
            // Atualizar veículo existente
            const updates: string[] = [];
            const values: any[] = [];
            let paramCount = 1;

            if (veiculo.placa !== undefined) {
              updates.push(`placa = $${paramCount++}`);
              values.push(veiculo.placa.toUpperCase());
            }
            if (veiculo.modelo !== undefined) {
              updates.push(`modelo = $${paramCount++}`);
              values.push(veiculo.modelo);
            }
            if (veiculo.ano !== undefined) {
              updates.push(`ano = $${paramCount++}`);
              values.push(veiculo.ano);
            }
            if (veiculo.chassi !== undefined) {
              updates.push(`chassi = $${paramCount++}`);
              values.push(veiculo.chassi ? veiculo.chassi.toUpperCase() : null);
            }
            if (veiculo.cor !== undefined) {
              updates.push(`cor = $${paramCount++}`);
              values.push(veiculo.cor);
            }
            if (veiculo.km_atual !== undefined) {
              updates.push(`km_atual = $${paramCount++}`);
              values.push(veiculo.km_atual);
            }

            if (updates.length > 0) {
              updates.push(`updated_at = NOW()`);
              values.push(veiculo.id, id);
              await client.query(
                `UPDATE veiculos SET ${updates.join(', ')} WHERE id = $${paramCount++} AND cliente_id = $${paramCount}`,
                values
              );
            }
          } else {
            // Criar novo veículo
            await client.query(
              `INSERT INTO veiculos (cliente_id, placa, modelo, ano, chassi, cor, km_atual, created_at, updated_at) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
              [
                id,
                veiculo.placa ? veiculo.placa.toUpperCase() : null,
                veiculo.modelo,
                veiculo.ano,
                veiculo.chassi ? veiculo.chassi.toUpperCase() : null,
                veiculo.cor,
                veiculo.km_atual || 0
              ]
            );
          }
        }
      }

      await client.query('COMMIT');
      const veiculos = await clienteRepository.findVeiculosByClienteId(id);
      return { ...cliente, veiculos };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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

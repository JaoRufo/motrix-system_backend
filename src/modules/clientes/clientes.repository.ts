import { pool } from '/home/joao_rufo/motrix_backend/src/config/database';
import { PoolClient } from 'pg';

export interface Cliente {
  id: number;
  nome: string;
  cpf?: string;
  telefone: string;
  email?: string;
  endereco?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Veiculo {
  id: number;
  cliente_id: number;
  placa: string;
  modelo: string;
  ano?: string;
  chassi?: string;
  cor?: string;
  km_atual: number;
  created_at: Date;
  updated_at: Date;
}

export const clienteRepository = {
  async findAll(): Promise<Cliente[]> {
    const result = await pool.query(
      'SELECT * FROM clientes ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: number): Promise<Cliente | null> {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findVeiculosByClienteId(clienteId: number): Promise<Veiculo[]> {
    const result = await pool.query(
      'SELECT * FROM veiculos WHERE cliente_id = $1 ORDER BY created_at DESC',
      [clienteId]
    );
    return result.rows;
  },

  async createWithVeiculos(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>, veiculos: Omit<Veiculo, 'id' | 'cliente_id' | 'created_at' | 'updated_at'>[]): Promise<{ cliente: Cliente; veiculos: Veiculo[] }> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');

      const clienteResult = await client.query(
        `INSERT INTO clientes (nome, cpf, telefone, email, endereco, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING *`,
        [cliente.nome, cliente.cpf, cliente.telefone, cliente.email, cliente.endereco]
      );

      const clienteCriado = clienteResult.rows[0];
      const veiculosCriados: Veiculo[] = [];

      for (const veiculo of veiculos) {
        const veiculoResult = await client.query(
          `INSERT INTO veiculos (cliente_id, placa, modelo, ano, chassi, cor, km_atual, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
           RETURNING *`,
          [clienteCriado.id, veiculo.placa.toUpperCase(), veiculo.modelo, veiculo.ano, veiculo.chassi?.toUpperCase(), veiculo.cor, veiculo.km_atual || 0]
        );
        veiculosCriados.push(veiculoResult.rows[0]);
      }

      await client.query('COMMIT');
      return { cliente: clienteCriado, veiculos: veiculosCriados };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id: number, data: Partial<Cliente>): Promise<Cliente | null> {
    const result = await pool.query(
      `UPDATE clientes 
       SET nome = COALESCE($1, nome),
           cpf = COALESCE($2, cpf),
           telefone = COALESCE($3, telefone),
           email = COALESCE($4, email),
           endereco = COALESCE($5, endereco),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [data.nome, data.cpf, data.telefone, data.email, data.endereco, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    return result.rowCount! > 0;
  },

  async getHistorico(clienteId: number) {
    const result = await pool.query(
      `SELECT os.*, v.placa, v.modelo 
       FROM ordens_servico os
       LEFT JOIN veiculos v ON os.veiculo_id = v.id
       WHERE os.cliente_id = $1
       ORDER BY os.data DESC`,
      [clienteId]
    );
    return result.rows;
  }
};

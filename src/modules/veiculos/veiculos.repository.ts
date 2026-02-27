import { pool } from '../../config/database';

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

export const veiculoRepository = {
  async findById(id: number): Promise<Veiculo | null> {
    const result = await pool.query('SELECT * FROM veiculos WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async update(id: number, data: Partial<Veiculo>): Promise<Veiculo | null> {
    const result = await pool.query(
      `UPDATE veiculos 
       SET placa = COALESCE($1, placa),
           modelo = COALESCE($2, modelo),
           ano = COALESCE($3, ano),
           chassi = COALESCE($4, chassi),
           cor = COALESCE($5, cor),
           km_atual = COALESCE($6, km_atual),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [data.placa?.toUpperCase(), data.modelo, data.ano, data.chassi?.toUpperCase(), data.cor, data.km_atual, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM veiculos WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
};

import { pool } from '../../config/database';

export interface Oficina {
  id: number;
  nome: string;
  cnpj: string;
  telefone?: string;
  endereco?: string;
  created_at: Date;
  updated_at: Date;
}

export const oficinaRepository = {
  async findFirst(): Promise<Oficina | null> {
    const result = await pool.query('SELECT * FROM oficinas LIMIT 1');
    return result.rows[0] || null;
  },

  async update(id: number, data: Partial<Oficina>): Promise<Oficina | null> {
    const result = await pool.query(
      `UPDATE oficinas 
       SET nome = COALESCE($1, nome),
           cnpj = COALESCE($2, cnpj),
           telefone = COALESCE($3, telefone),
           endereco = COALESCE($4, endereco),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [data.nome, data.cnpj, data.telefone, data.endereco, id]
    );
    return result.rows[0] || null;
  }
};

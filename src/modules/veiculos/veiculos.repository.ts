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
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.placa !== undefined) {
      updates.push(`placa = $${paramCount++}`);
      values.push(data.placa.toUpperCase());
    }
    if (data.modelo !== undefined) {
      updates.push(`modelo = $${paramCount++}`);
      values.push(data.modelo);
    }
    if (data.ano !== undefined) {
      updates.push(`ano = $${paramCount++}`);
      values.push(data.ano);
    }
    if (data.chassi !== undefined) {
      updates.push(`chassi = $${paramCount++}`);
      values.push(data.chassi ? data.chassi.toUpperCase() : null);
    }
    if (data.cor !== undefined) {
      updates.push(`cor = $${paramCount++}`);
      values.push(data.cor);
    }
    if (data.km_atual !== undefined) {
      updates.push(`km_atual = $${paramCount++}`);
      values.push(data.km_atual);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE veiculos SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM veiculos WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
};

import { pool } from '/home/joao_rufo/motrix_backend/src/config/database';
import { PoolClient } from 'pg';

export interface OrdemServico {
  id: number;
  cliente_id: number;
  veiculo_id?: number;
  veiculo_placa?: string;
  veiculo_chassi?: string;
  veiculo_cor?: string;
  veiculo_descricao?: string;
  km_atual: number;
  status: string;
  descricao_problema: string;
  observacoes?: string;
  motivo_cancelamento?: string;
  total: number;
  data: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OrdemPeca {
  id: number;
  ordem_id: number;
  nome: string;
  valor: number;
}

export interface OrdemMaoObra {
  id: number;
  ordem_id: number;
  descricao: string;
  valor: number;
}

export const ordemRepository = {
  async findAll(): Promise<OrdemServico[]> {
    const result = await pool.query(
      'SELECT * FROM ordens_servico ORDER BY data DESC'
    );
    return result.rows;
  },

  async findById(id: number): Promise<OrdemServico | null> {
    const result = await pool.query(
      'SELECT * FROM ordens_servico WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByPlaca(placa: string): Promise<OrdemServico[]> {
    const result = await pool.query(
      'SELECT * FROM ordens_servico WHERE veiculo_placa = $1 ORDER BY data DESC',
      [placa.toUpperCase()]
    );
    return result.rows;
  },

  async findPecasByOrdemId(ordemId: number): Promise<OrdemPeca[]> {
    const result = await pool.query(
      'SELECT * FROM ordem_pecas WHERE ordem_id = $1',
      [ordemId]
    );
    return result.rows;
  },

  async findMaoObraByOrdemId(ordemId: number): Promise<OrdemMaoObra[]> {
    const result = await pool.query(
      'SELECT * FROM ordem_mao_obra WHERE ordem_id = $1',
      [ordemId]
    );
    return result.rows;
  },

  async createWithItens(
    ordem: Omit<OrdemServico, 'id' | 'created_at' | 'updated_at' | 'total'>,
    pecas: Omit<OrdemPeca, 'id' | 'ordem_id'>[],
    maoObra: Omit<OrdemMaoObra, 'id' | 'ordem_id'>[]
  ): Promise<{ ordem: OrdemServico; pecas: OrdemPeca[]; maoObra: OrdemMaoObra[] }> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');

      const totalPecas = pecas.reduce((sum, p) => sum + Number(p.valor), 0);
      const totalMaoObra = maoObra.reduce((sum, m) => sum + Number(m.valor), 0);
      const total = totalPecas + totalMaoObra;

      const ordemResult = await client.query(
        `INSERT INTO ordens_servico (
          cliente_id, veiculo_id, veiculo_placa, veiculo_chassi, veiculo_cor, 
          veiculo_descricao, km_atual, status, descricao_problema, observacoes, 
          motivo_cancelamento, total, data, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW()) 
        RETURNING *`,
        [
          ordem.cliente_id,
          ordem.veiculo_id,
          ordem.veiculo_placa?.toUpperCase(),
          ordem.veiculo_chassi,
          ordem.veiculo_cor,
          ordem.veiculo_descricao,
          ordem.km_atual,
          ordem.status,
          ordem.descricao_problema,
          ordem.observacoes,
          ordem.motivo_cancelamento,
          total
        ]
      );

      const ordemCriada = ordemResult.rows[0];
      const pecasCriadas: OrdemPeca[] = [];
      const maoObraCriada: OrdemMaoObra[] = [];

      for (const peca of pecas) {
        const pecaResult = await client.query(
          'INSERT INTO ordem_pecas (ordem_id, nome, valor) VALUES ($1, $2, $3) RETURNING *',
          [ordemCriada.id, peca.nome, peca.valor]
        );
        pecasCriadas.push(pecaResult.rows[0]);
      }

      for (const mo of maoObra) {
        const moResult = await client.query(
          'INSERT INTO ordem_mao_obra (ordem_id, descricao, valor) VALUES ($1, $2, $3) RETURNING *',
          [ordemCriada.id, mo.descricao, mo.valor]
        );
        maoObraCriada.push(moResult.rows[0]);
      }

      if (ordem.veiculo_id && (ordem.status === 'Finalizada' || ordem.status === 'Cancelada')) {
        await client.query(
          'UPDATE veiculos SET km_atual = $1, updated_at = NOW() WHERE id = $2',
          [ordem.km_atual, ordem.veiculo_id]
        );
      }

      await client.query('COMMIT');
      return { ordem: ordemCriada, pecas: pecasCriadas, maoObra: maoObraCriada };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateWithItens(
    id: number,
    ordem: Partial<OrdemServico>,
    pecas?: Omit<OrdemPeca, 'id' | 'ordem_id'>[],
    maoObra?: Omit<OrdemMaoObra, 'id' | 'ordem_id'>[]
  ): Promise<{ ordem: OrdemServico; pecas: OrdemPeca[]; maoObra: OrdemMaoObra[] }> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');

      const ordemAtual = await this.findById(id);
      if (!ordemAtual) {
        throw new Error('Ordem não encontrada');
      }

      let total = ordemAtual.total;

      if (pecas && maoObra) {
        await client.query('DELETE FROM ordem_pecas WHERE ordem_id = $1', [id]);
        await client.query('DELETE FROM ordem_mao_obra WHERE ordem_id = $1', [id]);

        const totalPecas = pecas.reduce((sum, p) => sum + Number(p.valor), 0);
        const totalMaoObra = maoObra.reduce((sum, m) => sum + Number(m.valor), 0);
        total = totalPecas + totalMaoObra;
      }

      const ordemResult = await client.query(
        `UPDATE ordens_servico 
         SET cliente_id = COALESCE($1, cliente_id),
             veiculo_id = COALESCE($2, veiculo_id),
             veiculo_placa = COALESCE($3, veiculo_placa),
             veiculo_chassi = COALESCE($4, veiculo_chassi),
             veiculo_cor = COALESCE($5, veiculo_cor),
             veiculo_descricao = COALESCE($6, veiculo_descricao),
             km_atual = COALESCE($7, km_atual),
             status = COALESCE($8, status),
             descricao_problema = COALESCE($9, descricao_problema),
             observacoes = COALESCE($10, observacoes),
             motivo_cancelamento = COALESCE($11, motivo_cancelamento),
             total = $12,
             updated_at = NOW()
         WHERE id = $13
         RETURNING *`,
        [
          ordem.cliente_id,
          ordem.veiculo_id,
          ordem.veiculo_placa?.toUpperCase(),
          ordem.veiculo_chassi,
          ordem.veiculo_cor,
          ordem.veiculo_descricao,
          ordem.km_atual,
          ordem.status,
          ordem.descricao_problema,
          ordem.observacoes,
          ordem.motivo_cancelamento,
          total,
          id
        ]
      );

      const ordemAtualizada = ordemResult.rows[0];
      let pecasAtualizadas: OrdemPeca[] = [];
      let maoObraAtualizada: OrdemMaoObra[] = [];

      if (pecas) {
        for (const peca of pecas) {
          const pecaResult = await client.query(
            'INSERT INTO ordem_pecas (ordem_id, nome, valor) VALUES ($1, $2, $3) RETURNING *',
            [id, peca.nome, peca.valor]
          );
          pecasAtualizadas.push(pecaResult.rows[0]);
        }
      } else {
        pecasAtualizadas = await this.findPecasByOrdemId(id);
      }

      if (maoObra) {
        for (const mo of maoObra) {
          const moResult = await client.query(
            'INSERT INTO ordem_mao_obra (ordem_id, descricao, valor) VALUES ($1, $2, $3) RETURNING *',
            [id, mo.descricao, mo.valor]
          );
          maoObraAtualizada.push(moResult.rows[0]);
        }
      } else {
        maoObraAtualizada = await this.findMaoObraByOrdemId(id);
      }

      if (ordem.veiculo_id && ordem.km_atual && (ordem.status === 'Finalizada' || ordem.status === 'Cancelada')) {
        await client.query(
          'UPDATE veiculos SET km_atual = $1, updated_at = NOW() WHERE id = $2',
          [ordem.km_atual, ordem.veiculo_id]
        );
      }

      await client.query('COMMIT');
      return { ordem: ordemAtualizada, pecas: pecasAtualizadas, maoObra: maoObraAtualizada };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM ordens_servico WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
};

import { pool } from '../../config/database';

export const passwordResetRepository = {
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    // Invalida tokens anteriores do mesmo usuário
    await pool.query(
      'UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [userId]
    );
    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  },

  // Retorna todos os tokens válidos (não usados, não expirados) para comparação bcrypt
  async findCandidatesByExpiry() {
    const result = await pool.query(
      `SELECT * FROM password_resets WHERE used = FALSE AND expires_at > NOW() ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async markAsUsed(id: number): Promise<void> {
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [id]);
  }
};

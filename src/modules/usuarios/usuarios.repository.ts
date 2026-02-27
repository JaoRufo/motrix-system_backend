import { pool } from '/home/joao_rufo/motrix_backend/src/config/database';

export interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  senha: string;
  role: string;
  status: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  ultimo_acesso?: Date;
}

export const usuarioRepository = {
  async findByUsername(username: string): Promise<Usuario | null> {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  },

  async findByEmail(email: string): Promise<Usuario | null> {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id: number): Promise<Usuario | null> {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll(): Promise<Usuario[]> {
    const result = await pool.query(
      'SELECT id, nome, username, email, role, status, avatar_url, created_at, updated_at, ultimo_acesso FROM usuarios ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async create(data: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const result = await pool.query(
      `INSERT INTO usuarios (nome, username, email, senha, role, status, avatar_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [data.nome, data.username, data.email, data.senha, data.role || 'user', data.status || 'ativo', data.avatar_url]
    );
    return result.rows[0];
  },

  async update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    const result = await pool.query(
      `UPDATE usuarios 
       SET nome = COALESCE($1, nome),
           username = COALESCE($2, username),
           email = COALESCE($3, email),
           senha = COALESCE($4, senha),
           role = COALESCE($5, role),
           status = COALESCE($6, status),
           avatar_url = COALESCE($7, avatar_url),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [data.nome, data.username, data.email, data.senha, data.role, data.status, data.avatar_url, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return result.rowCount! > 0;
  },

  async updateUltimoAcesso(id: number): Promise<void> {
    await pool.query('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1', [id]);
  }
};

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
  oficina_nome?: string;
  oficina_telefone?: string;
  oficina_endereco?: string;
  mecanico_nome?: string;
  mecanico_id?: string;
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

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Usuario[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM usuarios');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      'SELECT id, nome, username, email, role, status, avatar_url, oficina_nome, oficina_telefone, oficina_endereco, mecanico_nome, mecanico_id, created_at, updated_at, ultimo_acesso FROM usuarios ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    return {
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  async findMecanicos(): Promise<Usuario[]> {
    const result = await pool.query(
      "SELECT id, nome, username, email, role, status, oficina_nome, oficina_telefone, oficina_endereco, mecanico_nome, mecanico_id FROM usuarios WHERE role = 'user' AND status = 'ativo' ORDER BY nome"
    );
    return result.rows;
  },

  async create(data: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const result = await pool.query(
      `INSERT INTO usuarios (nome, username, email, senha, role, status, avatar_url, oficina_nome, oficina_telefone, oficina_endereco, mecanico_nome) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [data.nome, data.username, data.email, data.senha, data.role || 'user', data.status || 'ativo', data.avatar_url, data.oficina_nome, data.oficina_telefone, data.oficina_endereco, data.mecanico_nome]
    );
    
    const usuario = result.rows[0];
    
    // Gerar mecanico_id automaticamente se for role 'user'
    if (usuario.role === 'user') {
      const mecanicoId = `MEC${String(usuario.id).padStart(4, '0')}`;
      await pool.query(
        'UPDATE usuarios SET mecanico_id = $1 WHERE id = $2',
        [mecanicoId, usuario.id]
      );
      usuario.mecanico_id = mecanicoId;
    }
    
    return usuario;
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
           oficina_nome = COALESCE($8, oficina_nome),
           oficina_telefone = COALESCE($9, oficina_telefone),
           oficina_endereco = COALESCE($10, oficina_endereco),
           mecanico_nome = COALESCE($11, mecanico_nome),
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [data.nome, data.username, data.email, data.senha, data.role, data.status, data.avatar_url, data.oficina_nome, data.oficina_telefone, data.oficina_endereco, data.mecanico_nome, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return result.rowCount! > 0;
  },

  async updateUltimoAcesso(id: number): Promise<void> {
    await pool.query('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1', [id]);
  },

  async updateSenha(id: number, senhaHash: string): Promise<void> {
    await pool.query(
      'UPDATE usuarios SET senha = $1, updated_at = NOW() WHERE id = $2',
      [senhaHash, id]
    );
  }
};

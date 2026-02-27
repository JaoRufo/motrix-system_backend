import bcrypt from 'bcryptjs';
import { usuarioRepository, Usuario } from './usuarios.repository';

export const usuarioService = {
  async getAll() {
    return await usuarioRepository.findAll();
  },

  async getById(id: number) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  },

  async create(data: { nome: string; username: string; email: string; senha: string; role?: string; status?: string; avatar_url?: string }) {
    if (data.senha.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const existeUsername = await usuarioRepository.findByUsername(data.username);
    if (existeUsername) {
      throw new Error('Username já está em uso');
    }

    const existeEmail = await usuarioRepository.findByEmail(data.email);
    if (existeEmail) {
      throw new Error('Email já está em uso');
    }

    const senhaHash = await bcrypt.hash(data.senha, parseInt(process.env.BCRYPT_ROUNDS || '10'));

    const usuario = await usuarioRepository.create({
      ...data,
      senha: senhaHash,
      role: data.role || 'user',
      status: data.status || 'ativo'
    });

    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  },

  async update(id: number, data: Partial<Usuario>) {
    const usuarioExiste = await usuarioRepository.findById(id);
    if (!usuarioExiste) {
      throw new Error('Usuário não encontrado');
    }

    if (data.username && data.username !== usuarioExiste.username) {
      const existeUsername = await usuarioRepository.findByUsername(data.username);
      if (existeUsername) {
        throw new Error('Username já está em uso');
      }
    }

    if (data.email && data.email !== usuarioExiste.email) {
      const existeEmail = await usuarioRepository.findByEmail(data.email);
      if (existeEmail) {
        throw new Error('Email já está em uso');
      }
    }

    if (data.senha) {
      if (data.senha.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }
      data.senha = await bcrypt.hash(data.senha, parseInt(process.env.BCRYPT_ROUNDS || '10'));
    }

    const usuario = await usuarioRepository.update(id, data);
    if (!usuario) {
      throw new Error('Erro ao atualizar usuário');
    }

    const { senha, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  },

  async delete(id: number) {
    const deleted = await usuarioRepository.delete(id);
    if (!deleted) {
      throw new Error('Usuário não encontrado');
    }
    return { message: 'Usuário excluído com sucesso' };
  }
};

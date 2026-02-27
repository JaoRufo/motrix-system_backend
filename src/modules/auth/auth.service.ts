import bcrypt from 'bcryptjs';
import { usuarioRepository } from '../usuarios/usuarios.repository';
import { generateToken } from '../../utils/jwt';

export const authService = {
  async login(username: string, password: string) {
    const usuario = await usuarioRepository.findByUsername(username);
    
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    if (usuario.status !== 'ativo') {
      throw new Error('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(password, usuario.senha);
    
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    await usuarioRepository.updateUltimoAcesso(usuario.id);

    const token = generateToken({
      id: usuario.id,
      username: usuario.username,
      role: usuario.role,
      status: usuario.status
    });

    return {
      user: {
        id: usuario.id,
        name: usuario.nome,
        username: usuario.username,
        email: usuario.email,
        role: usuario.role
      },
      token
    };
  },

  async register(data: { nome: string; username: string; email: string; senha: string }) {
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
      nome: data.nome,
      username: data.username,
      email: data.email,
      senha: senhaHash,
      role: 'user',
      status: 'ativo'
    });

    const token = generateToken({
      id: usuario.id,
      username: usuario.username,
      role: usuario.role,
      status: usuario.status
    });

    return {
      user: {
        id: usuario.id,
        name: usuario.nome,
        username: usuario.username,
        email: usuario.email,
        role: usuario.role
      },
      token
    };
  }
};

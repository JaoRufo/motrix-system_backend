import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { usuarioRepository } from '../usuarios/usuarios.repository';
import { passwordResetRepository } from './password-reset.repository';
import { logger } from '../../utils/logger';

const GENERIC_RESPONSE = 'Se o email estiver cadastrado, você receberá as instruções em breve.';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hora

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
}

export const passwordResetService = {
  async requestReset(email: string): Promise<string> {
    const usuario = await usuarioRepository.findByEmail(email);

    if (usuario) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(rawToken, 10);
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await passwordResetRepository.create(usuario.id, tokenHash, expiresAt);

      if (process.env.NODE_ENV !== 'production') {
        logger.info(`🔑 [DEV] Token de reset: ${rawToken}`);
      }

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"Motrix System" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Recuperação de senha - Motrix System',
          html: `
            <p>Olá, <strong>${usuario.nome}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no link abaixo para criar uma nova senha (válido por 1 hora):</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Se você não solicitou isso, ignore este email.</p>
          `,
        });
        logger.info(`📧 Email de recuperação enviado para: ${email}`);
      } catch (err: any) {
        logger.error(`❌ Falha ao enviar email de recuperação: ${err.message}`);
      }
    }

    return GENERIC_RESPONSE;
  },

  async validateToken(rawToken: string): Promise<boolean> {
    const resets = await passwordResetRepository.findCandidatesByExpiry();
    for (const reset of resets) {
      const match = await bcrypt.compare(rawToken, reset.token_hash);
      if (match) return true;
    }
    return false;
  },

  async resetPassword(rawToken: string, novaSenha: string): Promise<void> {
    if (novaSenha.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    const resets = await passwordResetRepository.findCandidatesByExpiry();
    let matched = null;

    for (const reset of resets) {
      const match = await bcrypt.compare(rawToken, reset.token_hash);
      if (match) { matched = reset; break; }
    }

    if (!matched) {
      throw new Error('Token inválido ou expirado');
    }

    const senhaHash = await bcrypt.hash(novaSenha, parseInt(process.env.BCRYPT_ROUNDS || '10'));
    await usuarioRepository.updateSenha(matched.user_id, senhaHash);
    await passwordResetRepository.markAsUsed(matched.id);

    logger.info(`✅ Senha redefinida para usuário ID: ${matched.user_id}`);
  }
};

import { Request, Response } from 'express';
import { authService } from './auth.service';
import { passwordResetService } from './password-reset.service';
import { validationResult } from 'express-validator';
import { logger } from '../../utils/logger';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn(`⚠️  Login falhou - Validação: ${req.body.username}`);
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { username, password } = req.body;
      const result = await authService.login(username, password);
      
      logger.info(`✅ Login bem-sucedido - Usuário: ${username} (${result.user.role})`);
      res.json(result);
    } catch (error: any) {
      logger.error(`❌ Login falhou - ${error.message}`);
      res.status(401).json({ error: error.message });
    }
  },

  async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn(`⚠️  Registro falhou - Validação`);
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const result = await authService.register(req.body);
      logger.info(`✅ Novo usuário registrado - ${req.body.username}`);
      res.status(201).json(result);
    } catch (error: any) {
      logger.error(`❌ Registro falhou - ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const message = await passwordResetService.requestReset(req.body.email);
      res.json({ message });
    } catch (error: any) {
      logger.error(`❌ Forgot password erro - ${error.message}`);
      // Sempre resposta genérica
      res.json({ message: 'Se o email estiver cadastrado, você receberá as instruções em breve.' });
    }
  },

  async validateResetToken(req: Request, res: Response) {
    try {
      const { token } = req.query as { token: string };
      if (!token) {
        res.status(400).json({ error: 'Token é obrigatório' });
        return;
      }
      const valid = await passwordResetService.validateToken(token);
      if (!valid) {
        res.status(400).json({ error: 'Token inválido ou expirado' });
        return;
      }
      res.json({ valid: true });
    } catch (error: any) {
      res.status(400).json({ error: 'Token inválido ou expirado' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const { token, novaSenha } = req.body;
      await passwordResetService.resetPassword(token, novaSenha);
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error: any) {
      logger.error(`❌ Reset password erro - ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  }
};

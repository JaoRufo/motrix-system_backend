import { Request, Response } from 'express';
import { authService } from './auth.service';
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
  }
};

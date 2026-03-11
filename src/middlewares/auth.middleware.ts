import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    status: string;
  };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('⚠️  Acesso negado - Token não fornecido');
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('❌ Token inválido ou expirado');
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const isActive = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.status?.trim().toLowerCase() !== 'ativo') {
    logger.warn(`⚠️  Acesso negado - Usuário inativo: ${req.user?.username}`);
    res.status(403).json({ error: 'Usuário inativo' });
    return;
  }
  next();
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    logger.warn(`⚠️  Acesso negado - Permissão insuficiente: ${req.user?.username}`);
    res.status(403).json({ error: 'Acesso negado. Apenas administradores' });
    return;
  }
  next();
};

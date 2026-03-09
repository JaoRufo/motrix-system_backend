import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { usuarioService } from './usuarios.service';
import { validationResult } from 'express-validator';

export const usuarioController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const usuarios = await usuarioService.getAll(page, limit);
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  },

  async getMecanicos(req: AuthRequest, res: Response) {
    try {
      const mecanicos = await usuarioService.getMecanicos();
      res.json(mecanicos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar mecânicos' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const usuario = await usuarioService.getById(id);
      res.json(usuario);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const usuario = await usuarioService.create(req.body);
      res.status(201).json(usuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id as string);
      const usuario = await usuarioService.update(id, req.body);
      res.json(usuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await usuarioService.delete(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
};

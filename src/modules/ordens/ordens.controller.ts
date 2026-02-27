import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ordemService } from './ordens.service';
import { validationResult } from 'express-validator';

export const ordemController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const ordens = await ordemService.getAll();
      res.json(ordens);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const ordem = await ordemService.getById(id);
      res.json(ordem);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async getByPlaca(req: AuthRequest, res: Response) {
    try {
      const placa = req.params.placa!;
      const ordens = await ordemService.getByPlaca(placa);
      res.json(ordens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const ordem = await ordemService.create(req.body);
      res.status(201).json(ordem);
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

      const id = parseInt(req.params.id!);
      const ordem = await ordemService.update(id, req.body);
      res.json(ordem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const result = await ordemService.delete(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
};

import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { clienteService } from './clientes.service';
import { validationResult } from 'express-validator';

export const clienteController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const clientes = await clienteService.getAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const cliente = await clienteService.getById(id);
      res.json(cliente);
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

      const cliente = await clienteService.create(req.body);
      res.status(201).json(cliente);
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
      const cliente = await clienteService.update(id, req.body);
      res.json(cliente);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const result = await clienteService.delete(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async getHistorico(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const historico = await clienteService.getHistorico(id);
      res.json(historico);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
};

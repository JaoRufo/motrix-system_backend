import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { oficinaService } from './oficinas.service';
import { validationResult } from 'express-validator';

export const oficinaController = {
  async get(req: AuthRequest, res: Response) {
    try {
      const oficina = await oficinaService.get();
      res.json(oficina);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
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
      const oficina = await oficinaService.update(id, req.body);
      res.json(oficina);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};

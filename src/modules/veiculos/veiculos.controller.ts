import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { veiculoService } from './veiculos.service';
import { validationResult } from 'express-validator';

export const veiculoController = {
  async update(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id!);
      const veiculo = await veiculoService.update(id, req.body);
      res.json(veiculo);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const result = await veiculoService.delete(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
};

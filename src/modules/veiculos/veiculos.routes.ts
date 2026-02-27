import { Router } from 'express';
import { body } from 'express-validator';
import { veiculoController } from './veiculos.controller';
import { isAuthenticated, isActive } from '../../middlewares/auth.middleware';

const router = Router();

router.put(
  '/:id',
  isAuthenticated,
  isActive,
  [
    body('placa').optional().notEmpty().withMessage('Placa não pode ser vazia'),
    body('modelo').optional().notEmpty().withMessage('Modelo não pode ser vazio')
  ],
  veiculoController.update
);

router.delete('/:id', isAuthenticated, isActive, veiculoController.delete);

export default router;

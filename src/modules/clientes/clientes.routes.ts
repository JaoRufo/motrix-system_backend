import { Router } from 'express';
import { body } from 'express-validator';
import { clienteController } from './clientes.controller';
import { isAuthenticated, isActive } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', isAuthenticated, isActive, clienteController.getAll);

router.get('/:id', isAuthenticated, isActive, clienteController.getById);

router.post(
  '/',
  isAuthenticated,
  isActive,
  [
    body('cliente.nome').notEmpty().withMessage('Nome do cliente é obrigatório'),
    body('cliente.telefone').notEmpty().withMessage('Telefone é obrigatório'),
    body('veiculos').isArray({ min: 1 }).withMessage('Cliente deve ter pelo menos 1 veículo'),
    body('veiculos.*.placa').notEmpty().withMessage('Placa é obrigatória'),
    body('veiculos.*.modelo').notEmpty().withMessage('Modelo é obrigatório')
  ],
  clienteController.create
);

router.put(
  '/:id',
  isAuthenticated,
  isActive,
  [
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    body('telefone').optional().notEmpty().withMessage('Telefone não pode ser vazio')
  ],
  clienteController.update
);

router.delete('/:id', isAuthenticated, isActive, clienteController.delete);

router.get('/:id/historico', isAuthenticated, isActive, clienteController.getHistorico);

export default router;

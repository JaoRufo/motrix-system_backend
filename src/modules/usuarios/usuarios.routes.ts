import { Router } from 'express';
import { body } from 'express-validator';
import { usuarioController } from './usuarios.controller';
import { isAuthenticated, isAdmin, isActive } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/mecanicos', isAuthenticated, isActive, usuarioController.getMecanicos);

router.get('/', isAuthenticated, isActive, isAdmin, usuarioController.getAll);

router.get('/:id', isAuthenticated, isActive, isAdmin, usuarioController.getById);

router.post(
  '/',
  isAuthenticated,
  isActive,
  isAdmin,
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('username').notEmpty().withMessage('Username é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role inválida')
  ],
  usuarioController.create
);

router.put(
  '/:id',
  isAuthenticated,
  isActive,
  isAdmin,
  [
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    body('username').optional().notEmpty().withMessage('Username não pode ser vazio'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('senha').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role inválida'),
    body('status').optional().isIn(['ativo', 'inativo']).withMessage('Status inválido')
  ],
  usuarioController.update
);

router.delete('/:id', isAuthenticated, isActive, isAdmin, usuarioController.delete);

export default router;

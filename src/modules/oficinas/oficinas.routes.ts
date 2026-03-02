import { Router } from 'express';
import { body } from 'express-validator';
import { oficinaController } from './oficinas.controller';
import { isAuthenticated, isActive, isAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', isAuthenticated, isActive, oficinaController.get);

router.put(
  '/:id',
  isAuthenticated,
  isActive,
  isAdmin,
  [
    body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    body('cnpj').optional().notEmpty().withMessage('CNPJ não pode ser vazio')
  ],
  oficinaController.update
);

export default router;

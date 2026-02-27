import { Router } from 'express';
import { body } from 'express-validator';
import { ordemController } from './ordens.controller';
import { isAuthenticated, isActive } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', isAuthenticated, isActive, ordemController.getAll);

router.get('/:id', isAuthenticated, isActive, ordemController.getById);

router.get('/veiculo/:placa', isAuthenticated, isActive, ordemController.getByPlaca);

router.post(
  '/',
  isAuthenticated,
  isActive,
  [
    body('ordem.cliente_id').isInt().withMessage('Cliente ID é obrigatório'),
    body('ordem.km_atual').isInt().withMessage('KM atual é obrigatório'),
    body('ordem.status').isIn(['Aberta', 'Em Andamento', 'Aguardando Orçamento', 'Finalizada', 'Cancelada']).withMessage('Status inválido'),
    body('ordem.descricao_problema').notEmpty().withMessage('Descrição do problema é obrigatória'),
    body('pecas').isArray().withMessage('Peças deve ser um array'),
    body('maoObra').isArray().withMessage('Mão de obra deve ser um array')
  ],
  ordemController.create
);

router.put(
  '/:id',
  isAuthenticated,
  isActive,
  [
    body('ordem.status').optional().isIn(['Aberta', 'Em Andamento', 'Aguardando Orçamento', 'Finalizada', 'Cancelada']).withMessage('Status inválido'),
    body('ordem.km_atual').optional().isInt().withMessage('KM atual deve ser um número'),
    body('pecas').optional().isArray().withMessage('Peças deve ser um array'),
    body('maoObra').optional().isArray().withMessage('Mão de obra deve ser um array')
  ],
  ordemController.update
);

router.delete('/:id', isAuthenticated, isActive, ordemController.delete);

router.get('/:id/pdf', isAuthenticated, isActive, ordemController.downloadPDF);

export default router;

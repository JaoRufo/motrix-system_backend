import { Router } from 'express';
import { body } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import { authController } from './auth.controller';

const router = Router();

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username é obrigatório'),
    body('password').notEmpty().withMessage('Password é obrigatório')
  ],
  authController.login
);

router.post(
  '/register',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('username').notEmpty().withMessage('Username é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  authController.register
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  [body('email').isEmail().withMessage('Email inválido')],
  authController.forgotPassword
);

router.get('/reset-password/validate', passwordResetLimiter, authController.validateResetToken);

router.post(
  '/reset-password',
  passwordResetLimiter,
  [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('novaSenha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  authController.resetPassword
);

export default router;

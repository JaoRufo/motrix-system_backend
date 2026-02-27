import { Router } from 'express'

import authRoutes from './modules/auth/auth.routes'
import clientesRoutes from './modules/clientes/clientes.routes'
import ordensRoutes from './modules/ordens/ordens.routes'
import usuariosRoutes from './modules/usuarios/usuarios.routes'

const routes = Router()

// Health check
routes.get('/', (req, res) => {
    res.json({ message: 'API Motrix rodando 🔥' })
})

/**
 * Rotas Públicas
 */
routes.use('/auth', authRoutes)

/**
 * Rotas Protegidas (precisam de middleware de auth)
 * Exemplo:
 * routes.use(authMiddleware)
 */

/**
 * Clientes
 */
routes.use('/clientes', clientesRoutes)

/**
 *  Ordens de Serviço
 */
routes.use('/ordens', ordensRoutes)

/**
 *  Usuários (Admin)
 */
routes.use('/usuarios', usuariosRoutes)

export default routes
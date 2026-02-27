import { Router } from 'express'

const routes = Router()

routes.get('/', (req, res) => {
    res.json({ message: 'API Motrix rodando 🔥' })
})

export default routes
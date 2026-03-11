import { Pool } from 'pg'
import dotenv from 'dotenv'
import { logger } from '../utils/logger'

dotenv.config()

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

pool.on('connect', () => {
  logger.info('📦 Conexão com PostgreSQL estabelecida');
});

pool.on('error', (err) => {
  logger.error('🔥 Erro no pool do PostgreSQL:');
  logger.error(err.message);
});
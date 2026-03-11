import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import routes from './routes'
import { logger } from './utils/logger'

dotenv.config()

const app = express()

// =========================
// LOGS DE INICIALIZAÇÃO
// =========================
logger.info('='.repeat(60));
logger.info('🚀 MOTRIX BACKEND - INICIANDO...');
logger.info('='.repeat(60));
logger.info(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
logger.info(`📊 Porta: ${process.env.PORT}`);
logger.info(`📦 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'N/A'}`);
logger.info('='.repeat(60));

// =========================
// MIDDLEWARES
// =========================
app.use(cors())
logger.info('✅ CORS habilitado');

app.use(express.json())
logger.info('✅ JSON parser habilitado');

// Morgan para logs de requisições HTTP
app.use(morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);
  
  const statusColor = Number(status) >= 500 ? '[31m' :
                      Number(status) >= 400 ? '[33m' :
                      Number(status) >= 300 ? '[36m' :
                      '[32m';
  
  logger.http(`${method} ${url} ${statusColor}${status}[0m - ${responseTime}ms`);
  return null;
}));

logger.info('✅ Logger HTTP habilitado');

// =========================
// ROTAS
// =========================
app.use('/api', routes)
logger.info('✅ Rotas carregadas');

// =========================
// SERVIDOR
// =========================
const server = app.listen(process.env.PORT, () => {
  logger.info('='.repeat(60));
  logger.info(`✅ SERVIDOR RODANDO NA PORTA ${process.env.PORT}`);
  logger.info(`🌐 http://localhost:${process.env.PORT}`);
  logger.info('='.repeat(60));
  logger.info('👀 Aguardando requisições...');
});

// =========================
// TRATAMENTO DE ENCERRAMENTO
// =========================
process.on('SIGINT', () => {
  logger.warn('\n' + '='.repeat(60));
  logger.warn('⚠️  SIGINT recebido - Encerrando servidor...');
  
  server.close(() => {
    logger.info('✅ Servidor encerrado com sucesso');
    logger.info('='.repeat(60));
    logger.info('👋 Até logo!');
    logger.info('='.repeat(60));
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.warn('\n' + '='.repeat(60));
  logger.warn('⚠️  SIGTERM recebido - Encerrando servidor...');
  
  server.close(() => {
    logger.info('✅ Servidor encerrado com sucesso');
    logger.info('='.repeat(60));
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('🔥 ERRO NÃO CAPTURADO:');
  logger.error(error.message);
  logger.error(error.stack || '');
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('🔥 PROMISE REJEITADA NÃO TRATADA:');
  logger.error(reason?.message || reason);
  process.exit(1);
});
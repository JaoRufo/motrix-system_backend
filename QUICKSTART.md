# 🚀 Guia Rápido - Motrix Backend

## Passo a Passo para Iniciar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados

#### Criar o banco de dados:
```bash
createdb oficina
```

#### Executar script de criação das tabelas:
```bash
psql -d oficina -f database.sql
```

#### (Opcional) Inserir dados de exemplo:
```bash
psql -d oficina -f seed.sql
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3000
DATABASE_URL=postgres://postgres:sua_senha@localhost:5432/oficina
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

### 4. Iniciar o Servidor

#### Modo desenvolvimento (com hot reload):
```bash
npm run dev
```

#### Modo produção:
```bash
npm run build
npm start
```

### 5. Testar a API

O servidor estará rodando em: `http://localhost:3000`

#### Teste de saúde:
```bash
curl http://localhost:3000/health
```

#### Login com usuário admin:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 6. Importar Coleção do Postman

Importe o arquivo `Motrix.postman_collection.json` no Postman para ter acesso a todos os endpoints prontos para teste.

## 📋 Credenciais Padrão

**Administrador:**
- Username: `admin`
- Password: `admin123`

**Usuário Comum (se executou seed.sql):**
- Username: `user`
- Password: `user123`

## 🔗 Endpoints Principais

- **Auth:** `/api/auth/login`, `/api/auth/register`
- **Usuários:** `/api/usuarios` (apenas admin)
- **Clientes:** `/api/clientes`
- **Ordens:** `/api/ordens`

## 📝 Estrutura de Autenticação

Após o login, use o token JWT no header:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

## ⚠️ Troubleshooting

### Erro de conexão com banco:
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -d oficina`

### Erro de porta em uso:
- Altere a `PORT` no arquivo `.env`

### Erro de módulos:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentação Completa

Consulte o arquivo `README.md` para documentação detalhada.

---

✅ Pronto! Seu backend Motrix está configurado e rodando!

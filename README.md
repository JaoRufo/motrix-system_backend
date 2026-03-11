# Motrix Backend - Sistema de Gestão de Oficina Mecânica

Backend completo para sistema de gestão de oficina mecânica desenvolvido com Node.js, Express, TypeScript e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset JavaScript com tipagem
- **PostgreSQL** - Banco de dados relacional
- **pg** - Driver nativo PostgreSQL
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **dotenv** - Variáveis de ambiente
- **CORS** - Controle de acesso
- **PDFKit** - Geração de PDF
- **Winston** - Sistema de logs
- **Morgan** - Logger HTTP

## 📁 Estrutura do Projeto

```
motrix_backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuração do PostgreSQL
│   ├── middlewares/
│   │   └── auth.middleware.ts   # Middlewares de autenticação
│   ├── modules/
│   │   ├── auth/                # Módulo de autenticação
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.routes.ts
│   │   ├── usuarios/            # Módulo de usuários
│   │   │   ├── usuarios.controller.ts
│   │   │   ├── usuarios.service.ts
│   │   │   ├── usuarios.repository.ts
│   │   │   └── usuarios.routes.ts
│   │   ├── clientes/            # Módulo de clientes
│   │   │   ├── clientes.controller.ts
│   │   │   ├── clientes.service.ts
│   │   │   ├── clientes.repository.ts
│   │   │   └── clientes.routes.ts
│   │   ├── veiculos/            # Módulo de veículos
│   │   │   ├── veiculos.controller.ts
│   │   │   ├── veiculos.service.ts
│   │   │   ├── veiculos.repository.ts
│   │   │   └── veiculos.routes.ts
│   │   ├── ordens/              # Módulo de ordens de serviço
│   │   │   ├── ordens.controller.ts
│   │   │   ├── ordens.service.ts
│   │   │   ├── ordens.repository.ts
│   │   │   └── ordens.routes.ts
│   │   └── oficinas/            # Módulo de oficinas
│   │       ├── oficinas.controller.ts
│   │       ├── oficinas.service.ts
│   │       ├── oficinas.repository.ts
│   │       └── oficinas.routes.ts
│   ├── utils/
│   │   ├── jwt.ts               # Utilitários JWT
│   │   ├── logger.ts            # Sistema de logs
│   │   └── pdf.ts               # Geração de PDF
│   ├── routes.ts                # Rotas principais
│   └── server.ts                # Servidor Express
├── database.sql                 # Script de criação do banco
├── database_update.sql          # Script de atualização do banco
├── start.sh                     # Script de inicialização
├── .env                         # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

## 🗄️ Banco de Dados

### Tabelas

- **usuarios** - Usuários do sistema (admin/user)
- **clientes** - Clientes da oficina
- **veiculos** - Veículos dos clientes
- **ordens_servico** - Ordens de serviço
- **ordem_pecas** - Peças utilizadas nas ordens
- **ordem_mao_obra** - Mão de obra das ordens
- **oficinas** - Dados da oficina (CNPJ, telefone, endereço)

### Configuração

1. Crie o banco de dados PostgreSQL:
```bash
sudo -u postgres createdb oficina
```

2. Execute o script SQL:
```bash
sudo -u postgres psql -d oficina -f database.sql
```

3. Execute o script de atualização:
```bash
sudo -u postgres psql -d oficina -f database_update.sql
```

4. Configure o arquivo `.env`:
```env
PORT=3000
DATABASE_URL=postgres://postgres:senha@localhost:5432/oficina
JWT_SECRET=sua_chave_super_ultra_secreta
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
NODE_ENV=development
```

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Iniciar com script (PostgreSQL + Servidor)
./start.sh
```

## 🔐 Autenticação

### Roles e Permissões

**Admin:**
- Acesso total ao sistema
- Gerenciar usuários (CRUD)
- Gerenciar clientes, veículos e ordens
- Configurar dados da oficina

**User:**
- Gerenciar clientes
- Gerenciar veículos
- Gerenciar ordens de serviço
- NÃO pode acessar rotas de usuários
- NÃO pode configurar oficina

### Middlewares

- `isAuthenticated` - Verifica token JWT
- `isActive` - Verifica se usuário está ativo
- `isAdmin` - Verifica se é administrador

## 🛣️ Rotas da API

### Públicas

```
POST /api/auth/login       # Login
POST /api/auth/register    # Registro
```

### Clientes (Autenticado + Ativo)

```
GET    /api/clientes              # Listar todos
GET    /api/clientes/:id          # Buscar por ID
POST   /api/clientes              # Criar (com veículos)
PUT    /api/clientes/:id          # Atualizar
DELETE /api/clientes/:id          # Excluir
GET    /api/clientes/:id/historico # Histórico de ordens
```

### Veículos (Autenticado + Ativo)

```
PUT    /api/veiculos/:id   # Atualizar veículo
DELETE /api/veiculos/:id   # Excluir veículo
```

### Ordens de Serviço (Autenticado + Ativo)

```
GET    /api/ordens                # Listar todas
GET    /api/ordens/:id            # Buscar por ID
POST   /api/ordens                # Criar
PUT    /api/ordens/:id            # Atualizar
DELETE /api/ordens/:id            # Excluir
GET    /api/ordens/veiculo/:placa # Buscar por placa
GET    /api/ordens/:id/pdf        # Baixar PDF da ordem
```

### Oficinas (Autenticado + Ativo)

```
GET    /api/oficinas       # Buscar dados da oficina
PUT    /api/oficinas/:id   # Atualizar oficina (Admin)
```

### Usuários (Autenticado + Ativo + Admin)

```
GET    /api/usuarios       # Listar todos
GET    /api/usuarios/:id   # Buscar por ID
POST   /api/usuarios       # Criar
PUT    /api/usuarios/:id   # Atualizar
DELETE /api/usuarios/:id   # Excluir
```

## 📝 Exemplos de Requisições

### Login

```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "user": {
    "id": 1,
    "name": "Administrador",
    "username": "admin",
    "email": "admin@motrix.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Criar Cliente

```json
POST /api/clientes
Authorization: Bearer {token}

{
  "cliente": {
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "telefone": "(11) 98765-4321",
    "email": "joao@email.com",
    "endereco": "Rua ABC, 123"
  },
  "veiculos": [
    {
      "placa": "ABC-1234",
      "modelo": "Fiat Uno",
      "ano": "2015",
      "chassi": "9BWZZZ377VT004251",
      "cor": "Branco",
      "km_atual": 50000
    }
  ]
}
```

### Atualizar Veículo

```json
PUT /api/veiculos/1
Authorization: Bearer {token}

{
  "placa": "ABC-1234",
  "modelo": "Fiat Uno",
  "ano": "2015",
  "chassi": "9BWZZZ377VT004251",
  "cor": "Preto",
  "km_atual": 55000
}
```

### Criar Ordem de Serviço

```json
POST /api/ordens
Authorization: Bearer {token}

{
  "ordem": {
    "cliente_id": 1,
    "veiculo_id": 1,
    "veiculo_placa": "ABC-1234",
    "km_atual": 51000,
    "status": "Aberta",
    "descricao_problema": "Troca de óleo e filtros",
    "observacoes": "Cliente solicitou revisão completa",
    "mecanico_id": 2
  },
  "pecas": [
    {
      "nome": "Óleo 5W30",
      "valor": 150.00
    },
    {
      "nome": "Filtro de óleo",
      "valor": 45.00
    }
  ],
  "maoObra": [
    {
      "descricao": "Troca de óleo",
      "valor": 80.00
    }
  ]
}
```

### Configurar Oficina

```json
PUT /api/oficinas/1
Authorization: Bearer {token}

{
  "nome": "Motrix Auto Center",
  "cnpj": "12.345.678/0001-90",
  "telefone": "(11) 3456-7890",
  "endereco": "Rua das Oficinas, 100 - São Paulo/SP"
}
```

## 📄 Geração de PDF

O sistema gera PDF profissional das ordens de serviço com:

- ✅ Cabeçalho com dados da oficina (nome, CNPJ, telefone, endereço)
- ✅ Número da OS formatado (000001)
- ✅ Data e hora de abertura e geração
- ✅ Status da ordem
- ✅ Dados completos do cliente (nome, telefone, CPF, endereço)
- ✅ Dados completos do veículo (placa, modelo, chassi, cor, KM)
- ✅ Nome do mecânico responsável
- ✅ Descrição do problema e observações
- ✅ Lista detalhada de peças com valores
- ✅ Lista detalhada de mão de obra com valores
- ✅ Valor total destacado
- ✅ Campos para assinatura do cliente e mecânico
- ✅ Layout profissional pronto para impressão (A4)

**Rota:** `GET /api/ordens/:id/pdf`

## 🔒 Regras de Negócio

1. Cliente deve ter pelo menos 1 veículo
2. Username e email devem ser únicos
3. Usuário inativo não pode fazer login
4. Usuário comum não acessa rotas admin
5. Total da ordem = soma(peças) + soma(mão de obra)
6. Motivo de cancelamento obrigatório se status = 'Cancelada'
7. KM do veículo atualizado quando ordem finalizada/cancelada
8. Todas as operações críticas usam transações SQL
9. Placa e chassi sempre salvos em MAIÚSCULO
10. Mecânico responsável é opcional na ordem de serviço

## 🎯 Status de Ordem de Serviço

- `Aberta`
- `Em Andamento`
- `Aguardando Orçamento`
- `Finalizada`
- `Cancelada`


## 🛡️ Segurança

- Senhas com hash bcrypt (10 rounds)
- JWT com expiração de 24h
- Validação de dados com express-validator
- Proteção de rotas com middlewares
- Transações SQL para integridade de dados
- CORS habilitado
- Logs de todas as operações
- Tratamento de erros não capturados

## 📊 Performance

- Índices no banco de dados:
  - ordens_servico(cliente_id)
  - ordens_servico(veiculo_placa)
  - ordens_servico(status)
  - ordens_servico(data)
  - veiculos(cliente_id)

## 📋 Sistema de Logs

O sistema possui logs completos e coloridos:

- ✅ Inicialização do servidor
- ✅ Conexão com banco de dados
- ✅ Todas as requisições HTTP (método, URL, status, tempo)
- ✅ Login/logout de usuários
- ✅ Operações CRUD
- ✅ Erros e exceções
- ✅ Encerramento gracioso (CTRL+C)

## 🧪 Testando a API

Use ferramentas como:
- Postman
- Insomnia
- Thunder Client (VS Code)
- cURL

## 🚀 Deploy em Produção

### Checklist

- [ ] Implementar sistema de migrations (node-pg-migrate)
- [ ] Configurar backup automático do banco
- [ ] Separar variáveis de ambiente (dev/prod)
- [ ] Configurar logs em arquivo (não apenas console)
- [ ] Implementar monitoramento de erros (Sentry)
- [ ] Configurar CI/CD
- [ ] Implementar testes automatizados
- [ ] Configurar SSL/HTTPS
- [ ] Limitar rate de requisições
- [ ] Configurar health check endpoint

### Variáveis de Ambiente Produção

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://user:pass@host:5432/db
JWT_SECRET=chave_super_secreta_producao
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```

## 📄 Documentação Adicional

- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - Guia de integração com frontend

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para o sistema Motrix - Propriedade de João Victor Rufo Pereira.

---

**Desenvolvido para gestão de oficinas mecânicas**

**Versão:** 2.0.0  
**Última atualização:** Março de 2026

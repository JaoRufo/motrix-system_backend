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
│   │   └── ordens/              # Módulo de ordens de serviço
│   │       ├── ordens.controller.ts
│   │       ├── ordens.service.ts
│   │       ├── ordens.repository.ts
│   │       └── ordens.routes.ts
│   ├── utils/
│   │   └── jwt.ts               # Utilitários JWT
│   ├── routes.ts                # Rotas principais
│   └── server.ts                # Servidor Express
├── database.sql                 # Script de criação do banco
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

### Configuração

1. Crie o banco de dados PostgreSQL:
```bash
createdb oficina
```

2. Execute o script SQL:
```bash
psql -d oficina -f database.sql
```

3. Configure o arquivo `.env`:
```env
PORT=3000
DATABASE_URL=postgres://postgres:senha@localhost:5432/oficina
JWT_SECRET=sua_chave_super_ultra_secreta
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
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
```

## 🔐 Autenticação

### Roles e Permissões

**Admin:**
- Acesso total ao sistema
- Gerenciar usuários (CRUD)
- Gerenciar clientes e ordens

**User:**
- Gerenciar clientes
- Gerenciar ordens de serviço
- NÃO pode acessar rotas de usuários

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

### Ordens de Serviço (Autenticado + Ativo)

```
GET    /api/ordens                # Listar todas
GET    /api/ordens/:id            # Buscar por ID
POST   /api/ordens                # Criar
PUT    /api/ordens/:id            # Atualizar
DELETE /api/ordens/:id            # Excluir
GET    /api/ordens/veiculo/:placa # Buscar por placa
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
      "ano": "2000",
      "cor": "Branco",
      "km_atual": 50000
    }
  ]
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
    "observacoes": "Cliente solicitou revisão completa"
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

## 🔒 Regras de Negócio

1. Cliente deve ter pelo menos 1 veículo
2. Username e email devem ser únicos
3. Usuário inativo não pode fazer login
4. Usuário comum não acessa rotas admin
5. Total da ordem = soma(peças) + soma(mão de obra)
6. Motivo de cancelamento obrigatório se status = 'Cancelada'
7. KM do veículo atualizado quando ordem finalizada/cancelada
8. Todas as operações críticas usam transações SQL

## 🎯 Status de Ordem de Serviço

- `Aberta`
- `Em Andamento`
- `Aguardando Orçamento`
- `Finalizada`
- `Cancelada`

## 👤 Usuário Padrão

```
Username: admin
Password: admin123
Role: admin
```

## 🛡️ Segurança

- Senhas com hash bcrypt (10 rounds)
- JWT com expiração de 24h
- Validação de dados com express-validator
- Proteção de rotas com middlewares
- Transações SQL para integridade de dados
- CORS habilitado

## 📊 Performance

- Índices no banco de dados:
  - ordens_servico(cliente_id)
  - ordens_servico(veiculo_placa)
  - ordens_servico(status)
  - ordens_servico(data)
  - veiculos(cliente_id)

## 🧪 Testando a API

Use ferramentas como:
- Postman
- Insomnia
- Thunder Client (VS Code)
- cURL

## 📄 Licença

Este projeto foi desenvolvido para o sistema Motrix.

---

Desenvolvido para gestão de oficinas mecânicas

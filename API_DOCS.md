# Documentação da API - Motrix Backend

## Base URL
```
http://localhost:3000/api
```

## Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer {token}
```

---

## 🔓 Rotas Públicas

### POST /auth/login
Realiza login no sistema.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
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

**Errors:**
- 401: Credenciais inválidas
- 403: Usuário inativo

---

### POST /auth/register
Registra novo usuário (role: user).

**Request:**
```json
{
  "nome": "João Silva",
  "username": "joao",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 2,
    "name": "João Silva",
    "username": "joao",
    "email": "joao@email.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👥 Clientes (Autenticado + Ativo)

### GET /clientes
Lista todos os clientes com seus veículos.

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "Maria Santos",
    "cpf": "111.222.333-44",
    "telefone": "(11) 91234-5678",
    "email": "maria@email.com",
    "endereco": "Rua das Flores, 100",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "veiculos": [
      {
        "id": 1,
        "cliente_id": 1,
        "placa": "ABC-1234",
        "modelo": "Fiat Uno",
        "ano": "2008",
        "chassi": "9BWZZZ377VT004251",
        "cor": "Branco",
        "km_atual": 45000,
        "created_at": "2024-01-15T10:00:00.000Z",
        "updated_at": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
]
```

---

### GET /clientes/:id
Busca cliente por ID com seus veículos.

**Response (200):**
```json
{
  "id": 1,
  "nome": "Maria Santos",
  "cpf": "111.222.333-44",
  "telefone": "(11) 91234-5678",
  "email": "maria@email.com",
  "endereco": "Rua das Flores, 100",
  "veiculos": [...]
}
```

**Errors:**
- 404: Cliente não encontrado

---

### POST /clientes
Cria novo cliente com veículos.

**Request:**
```json
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
      "ano": "2020",
      "chassi": "9BWZZZ377VT004251",
      "cor": "Branco",
      "km_atual": 50000
    }
  ]
}
```

**Response (201):**
```json
{
  "id": 2,
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "telefone": "(11) 98765-4321",
  "email": "joao@email.com",
  "endereco": "Rua ABC, 123",
  "veiculos": [...]
}
```

**Errors:**
- 400: Cliente deve ter pelo menos 1 veículo

---

### PUT /clientes/:id
Atualiza dados do cliente.

**Request:**
```json
{
  "nome": "João Silva Santos",
  "telefone": "(11) 99999-9999"
}
```

**Response (200):**
```json
{
  "id": 2,
  "nome": "João Silva Santos",
  "telefone": "(11) 99999-9999",
  ...
}
```

---

### DELETE /clientes/:id
Exclui cliente (cascade para veículos).

**Response (200):**
```json
{
  "message": "Cliente excluído com sucesso"
}
```

---

### GET /clientes/:id/historico
Retorna histórico de ordens do cliente.

**Response (200):**
```json
[
  {
    "id": 1,
    "cliente_id": 1,
    "veiculo_placa": "ABC-1234",
    "status": "Finalizada",
    "total": 275.00,
    "data": "2024-01-15T10:00:00.000Z",
    ...
  }
]
```

---

## 🔧 Ordens de Serviço (Autenticado + Ativo)

### GET /ordens
Lista todas as ordens com peças e mão de obra.

**Response (200):**
```json
[
  {
    "id": 1,
    "cliente_id": 1,
    "veiculo_id": 1,
    "veiculo_placa": "ABC-1234",
    "km_atual": 45000,
    "status": "Finalizada",
    "descricao_problema": "Troca de óleo e filtros",
    "observacoes": "Revisão dos 45.000 km",
    "total": 275.00,
    "data": "2024-01-15T10:00:00.000Z",
    "pecas": [
      {
        "id": 1,
        "ordem_id": 1,
        "nome": "Óleo 5W30",
        "valor": 150.00
      }
    ],
    "maoObra": [
      {
        "id": 1,
        "ordem_id": 1,
        "descricao": "Troca de óleo",
        "valor": 80.00
      }
    ]
  }
]
```

---

### GET /ordens/:id
Busca ordem por ID.

**Response (200):**
```json
{
  "id": 1,
  "cliente_id": 1,
  "veiculo_placa": "ABC-1234",
  "status": "Finalizada",
  "total": 275.00,
  "pecas": [...],
  "maoObra": [...]
}
```

---

### GET /ordens/veiculo/:placa
Busca ordens por placa do veículo.

**Response (200):**
```json
[
  {
    "id": 1,
    "veiculo_placa": "ABC-1234",
    "status": "Finalizada",
    ...
  }
]
```

---

### POST /ordens
Cria nova ordem de serviço.

**Request:**
```json
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

**Response (201):**
```json
{
  "id": 2,
  "cliente_id": 1,
  "total": 230.00,
  "pecas": [...],
  "maoObra": [...]
}
```

**Regras:**
- Total calculado automaticamente
- Status válidos: 'Aberta', 'Em Andamento', 'Aguardando Orçamento', 'Finalizada', 'Cancelada'
- Se status = 'Cancelada', motivo_cancelamento é obrigatório
- Se status = 'Finalizada' ou 'Cancelada', atualiza km_atual do veículo

---

### PUT /ordens/:id
Atualiza ordem de serviço.

**Request:**
```json
{
  "ordem": {
    "status": "Finalizada",
    "observacoes": "Serviço concluído"
  },
  "pecas": [...],
  "maoObra": [...]
}
```

**Response (200):**
```json
{
  "id": 2,
  "status": "Finalizada",
  "total": 230.00,
  ...
}
```

---

### DELETE /ordens/:id
Exclui ordem de serviço.

**Response (200):**
```json
{
  "message": "Ordem de serviço excluída com sucesso"
}
```

---

## 👤 Usuários (Autenticado + Ativo + Admin)

### GET /usuarios
Lista todos os usuários.

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "Administrador",
    "username": "admin",
    "email": "admin@motrix.com",
    "role": "admin",
    "status": "ativo",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### GET /usuarios/:id
Busca usuário por ID.

**Response (200):**
```json
{
  "id": 1,
  "nome": "Administrador",
  "username": "admin",
  "email": "admin@motrix.com",
  "role": "admin",
  "status": "ativo"
}
```

---

### POST /usuarios
Cria novo usuário.

**Request:**
```json
{
  "nome": "João Silva",
  "username": "joao",
  "email": "joao@motrix.com",
  "senha": "senha123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "id": 2,
  "nome": "João Silva",
  "username": "joao",
  "email": "joao@motrix.com",
  "role": "user",
  "status": "ativo"
}
```

**Errors:**
- 400: Username já está em uso
- 400: Email já está em uso
- 400: Senha deve ter no mínimo 6 caracteres

---

### PUT /usuarios/:id
Atualiza usuário.

**Request:**
```json
{
  "nome": "João Silva Santos",
  "status": "inativo"
}
```

**Response (200):**
```json
{
  "id": 2,
  "nome": "João Silva Santos",
  "status": "inativo",
  ...
}
```

---

### DELETE /usuarios/:id
Exclui usuário.

**Response (200):**
```json
{
  "message": "Usuário excluído com sucesso"
}
```

---

## 📊 Códigos de Status HTTP

- **200** - OK
- **201** - Created
- **400** - Bad Request (validação falhou)
- **401** - Unauthorized (token inválido/ausente)
- **403** - Forbidden (sem permissão)
- **404** - Not Found
- **500** - Internal Server Error

---

## 🔐 Permissões por Role

### Admin
- ✅ Todas as rotas
- ✅ Gerenciar usuários
- ✅ Gerenciar clientes
- ✅ Gerenciar ordens

### User
- ✅ Gerenciar clientes
- ✅ Gerenciar ordens
- ❌ Gerenciar usuários

---

## 💡 Dicas

1. Sempre inclua o token JWT no header Authorization
2. Placas são sempre convertidas para maiúsculas
3. Total da ordem é calculado automaticamente
4. Use transações para operações críticas
5. Valide dados no frontend antes de enviar

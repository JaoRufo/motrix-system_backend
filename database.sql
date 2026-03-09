-- Criação do banco de dados Motrix
-- Execute este script no PostgreSQL

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  avatar_url VARCHAR(500),
  oficina_nome VARCHAR(255),
  oficina_telefone VARCHAR(20),
  oficina_endereco TEXT,
  mecanico_nome VARCHAR(255),
  mecanico_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ultimo_acesso TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  endereco TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS veiculos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  placa VARCHAR(10) NOT NULL,
  modelo VARCHAR(255) NOT NULL,
  ano VARCHAR(4),
  chassi VARCHAR(50),
  cor VARCHAR(50),
  km_atual INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de ordens de serviço
CREATE TABLE IF NOT EXISTS ordens_servico (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE SET NULL,
  oficina_id INTEGER REFERENCES oficinas(id) ON DELETE SET NULL,
  veiculo_placa VARCHAR(10),
  veiculo_chassi VARCHAR(50),
  veiculo_cor VARCHAR(50),
  veiculo_descricao VARCHAR(255),
  km_atual INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Aberta', 'Em Andamento', 'Aguardando Orçamento', 'Finalizada', 'Cancelada')),
  descricao_problema TEXT NOT NULL,
  observacoes TEXT,
  motivo_cancelamento TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  data TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de peças da ordem
CREATE TABLE IF NOT EXISTS ordem_pecas (
  id SERIAL PRIMARY KEY,
  ordem_id INTEGER NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL
);

-- Tabela de mão de obra da ordem
CREATE TABLE IF NOT EXISTS ordem_mao_obra (
  id SERIAL PRIMARY KEY,
  ordem_id INTEGER NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ordens_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordens_veiculo_placa ON ordens_servico(veiculo_placa);
CREATE INDEX IF NOT EXISTS idx_ordens_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_ordens_data ON ordens_servico(data);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente_id ON veiculos(cliente_id);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO usuarios (nome, username, email, senha, role, status)
VALUES (
  'Administrador',
  'admin',
  'admin@motrix.com',
  '$2b$10$/8B11pqfXSgVTtOHbIWeaOVPfN7xYap7yPKoqkLZfTLbIZrE.618C',
  'admin',
  'ativo'
) ON CONFLICT (username) DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema';
COMMENT ON TABLE clientes IS 'Tabela de clientes da oficina';
COMMENT ON TABLE veiculos IS 'Tabela de veículos dos clientes';
COMMENT ON TABLE ordens_servico IS 'Tabela de ordens de serviço';
COMMENT ON TABLE ordem_pecas IS 'Tabela de peças utilizadas nas ordens';
COMMENT ON TABLE ordem_mao_obra IS 'Tabela de mão de obra das ordens';

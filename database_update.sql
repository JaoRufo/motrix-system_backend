-- Adicionar tabela de oficinas/empresas
CREATE TABLE IF NOT EXISTS oficinas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  endereco TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar campo mechanic_id na tabela ordens_servico
ALTER TABLE ordens_servico 
ADD COLUMN IF NOT EXISTS mecanico_id INTEGER REFERENCES usuarios(id);

-- Inserir oficina padrão
INSERT INTO oficinas (nome, cnpj, telefone, endereco)
VALUES (
  'Motrix Auto Center',
  '12.345.678/0001-90',
  '(11) 3456-7890',
  'Rua das Oficinas, 100 - São Paulo/SP'
) ON CONFLICT (cnpj) DO NOTHING;

COMMENT ON TABLE oficinas IS 'Tabela de oficinas/empresas';

-- Adicionar data_prevista na tabela ordens_servico
ALTER TABLE ordens_servico
ADD COLUMN IF NOT EXISTS data_prevista DATE;

CREATE INDEX IF NOT EXISTS idx_ordens_data_prevista ON ordens_servico(data_prevista);

-- Adicionar campo oficina_id na tabela ordens_servico
ALTER TABLE ordens_servico 
ADD COLUMN IF NOT EXISTS oficina_id INTEGER REFERENCES oficinas(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_ordens_oficina_id ON ordens_servico(oficina_id);

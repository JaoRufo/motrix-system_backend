-- Adicionar campos de oficina e mecânico na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS oficina_nome VARCHAR(255),
ADD COLUMN IF NOT EXISTS mecanico_nome VARCHAR(255),
ADD COLUMN IF NOT EXISTS mecanico_id VARCHAR(100);

-- Adicionar campo oficina_endereco na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS oficina_endereco TEXT;

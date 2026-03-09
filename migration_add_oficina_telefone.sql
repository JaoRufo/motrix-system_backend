-- Adicionar campo oficina_telefone na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS oficina_telefone VARCHAR(20);

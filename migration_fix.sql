-- Script de migração para corrigir constraint de foreign key
-- Execute este script no banco de dados existente

-- Remover a constraint antiga
ALTER TABLE ordens_servico 
DROP CONSTRAINT IF EXISTS ordens_servico_cliente_id_fkey;

-- Adicionar a nova constraint com ON DELETE CASCADE
ALTER TABLE ordens_servico 
ADD CONSTRAINT ordens_servico_cliente_id_fkey 
FOREIGN KEY (cliente_id) 
REFERENCES clientes(id) 
ON DELETE CASCADE;

-- Verificar se a constraint foi criada corretamente
SELECT conname, confdeltype 
FROM pg_constraint 
WHERE conname = 'ordens_servico_cliente_id_fkey';

-- Script de dados de exemplo para testes
-- Execute após o database.sql

-- Inserir clientes de exemplo
INSERT INTO clientes (nome, cpf, telefone, email, endereco, created_at, updated_at)
VALUES 
  ('Maria Santos', '111.222.333-44', '(11) 91234-5678', 'maria@email.com', 'Rua das Flores, 100', NOW(), NOW()),
  ('Pedro Oliveira', '222.333.444-55', '(11) 92345-6789', 'pedro@email.com', 'Av. Principal, 200', NOW(), NOW()),
  ('Ana Costa', '333.444.555-66', '(11) 93456-7890', 'ana@email.com', 'Rua Central, 300', NOW(), NOW());

-- Inserir veículos de exemplo
INSERT INTO veiculos (cliente_id, placa, modelo, ano, chassi, cor, km_atual, created_at, updated_at)
VALUES 
  (1, 'ABC-1234', 'Fiat Uno', '2008', '9BWZZZ377VT004251', 'Branco', 45000, NOW(), NOW()),
  (1, 'DEF-5678', 'Honda Civic', '2020', '19XFC2F59LE123456', 'Preto', 30000, NOW(), NOW()),
  (2, 'GHI-9012', 'Toyota Corolla', '2019', 'JTDKN3DU5A0123456', 'Prata', 55000, NOW(), NOW()),
  (3, 'JKL-3456', 'Volkswagen Gol', '2017', '9BWAA05U7ET123456', 'Vermelho', 70000, NOW(), NOW());

-- Inserir ordens de serviço de exemplo
INSERT INTO ordens_servico (
  cliente_id, veiculo_id, veiculo_placa, km_atual, status, 
  descricao_problema, observacoes, total, data, created_at, updated_at
)
VALUES 
  (
    1, 1, 'ABC-1234', 45000, 'Finalizada',
    'Troca de óleo e filtros',
    'Revisão dos 45.000 km',
    275.00,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  ),
  (
    2, 3, 'GHI-9012', 55000, 'Em Andamento',
    'Barulho no motor e troca de pastilhas de freio',
    'Cliente relatou barulho ao acelerar',
    850.00,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    3, 4, 'JKL-3456', 70000, 'Aberta',
    'Revisão completa dos 70.000 km',
    'Incluir verificação de suspensão',
    0.00,
    NOW(),
    NOW(),
    NOW()
  );

-- Inserir peças das ordens
INSERT INTO ordem_pecas (ordem_id, nome, valor)
VALUES 
  (1, 'Óleo 5W30', 150.00),
  (1, 'Filtro de óleo', 45.00),
  (2, 'Pastilhas de freio dianteiras', 280.00),
  (2, 'Pastilhas de freio traseiras', 220.00);

-- Inserir mão de obra das ordens
INSERT INTO ordem_mao_obra (ordem_id, descricao, valor)
VALUES 
  (1, 'Troca de óleo e filtros', 80.00),
  (2, 'Troca de pastilhas de freio', 200.00),
  (2, 'Diagnóstico de motor', 150.00);

-- Inserir usuário comum de exemplo (senha: user123)
INSERT INTO usuarios (nome, username, email, senha, role, status, created_at, updated_at)
VALUES (
  'Usuário Comum',
  'user',
  'user@motrix.com',
  '$2b$10$rZ5YvqhZ5YvqhZ5YvqhZ5.YvqhZ5YvqhZ5YvqhZ5YvqhZ5YvqhZ5Y',
  'user',
  'ativo',
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Verificar dados inseridos
SELECT 'Clientes cadastrados:' as info, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Veículos cadastrados:', COUNT(*) FROM veiculos
UNION ALL
SELECT 'Ordens de serviço:', COUNT(*) FROM ordens_servico
UNION ALL
SELECT 'Usuários:', COUNT(*) FROM usuarios;

#!/bin/bash

echo "🔧 Motrix Backend - Script de Setup"
echo "===================================="
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL primeiro."
    exit 1
fi

echo "✅ PostgreSQL encontrado"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"
echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Por favor, configure suas variáveis de ambiente."
    echo ""
else
    echo "ℹ️  Arquivo .env já existe"
    echo ""
fi

# Perguntar se deseja criar o banco de dados
read -p "Deseja criar o banco de dados 'oficina'? (s/n): " criar_db

if [ "$criar_db" = "s" ] || [ "$criar_db" = "S" ]; then
    echo ""
    echo "🗄️  Criando banco de dados..."
    
    # Solicitar credenciais do PostgreSQL
    read -p "Usuário PostgreSQL (padrão: postgres): " pg_user
    pg_user=${pg_user:-postgres}
    
    # Criar banco de dados
    createdb -U $pg_user oficina 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Banco de dados 'oficina' criado"
    else
        echo "ℹ️  Banco de dados 'oficina' já existe ou erro ao criar"
    fi
    
    echo ""
    read -p "Deseja executar o script de criação das tabelas? (s/n): " criar_tabelas
    
    if [ "$criar_tabelas" = "s" ] || [ "$criar_tabelas" = "S" ]; then
        echo "📊 Criando tabelas..."
        psql -U $pg_user -d oficina -f database.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Tabelas criadas com sucesso"
        else
            echo "❌ Erro ao criar tabelas"
            exit 1
        fi
        
        echo ""
        read -p "Deseja inserir dados de exemplo? (s/n): " inserir_dados
        
        if [ "$inserir_dados" = "s" ] || [ "$inserir_dados" = "S" ]; then
            echo "📝 Inserindo dados de exemplo..."
            psql -U $pg_user -d oficina -f seed.sql
            
            if [ $? -eq 0 ]; then
                echo "✅ Dados de exemplo inseridos"
            else
                echo "❌ Erro ao inserir dados"
            fi
        fi
    fi
fi

echo ""
echo "===================================="
echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o arquivo .env com suas credenciais"
echo "2. Execute 'npm run dev' para iniciar o servidor"
echo "3. Acesse http://localhost:3000/health para testar"
echo ""
echo "📚 Credenciais padrão:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🚀 Bom desenvolvimento!"

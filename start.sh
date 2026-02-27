#!/bin/bash

echo "🚀 Iniciando Motrix Backend..."

echo "📦 Iniciando PostgreSQL..."
sudo service postgresql start

echo "⚡ Iniciando servidor de desenvolvimento..."
npm run dev

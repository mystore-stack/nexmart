#!/bin/bash
# ─────────────────────────────────────────────────────────────
# NexMart — Script de configuration automatique
# Usage: bash scripts/setup.sh
# ─────────────────────────────────────────────────────────────

set -e

echo ""
echo "🚀 NexMart Setup Script"
echo "========================"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé. Installez Node.js 20+ depuis https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js 18+ requis. Version actuelle: $(node -v)"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# Vérifier Docker
if command -v docker &> /dev/null; then
  echo "✅ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
  HAS_DOCKER=true
else
  echo "⚠️  Docker non trouvé — démarrez PostgreSQL et Redis manuellement"
  HAS_DOCKER=false
fi

# Copier .env.local si absent
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  echo "✅ .env.local créé (remplissez les valeurs Stripe et Cloudinary)"
else
  echo "✅ .env.local existe déjà"
fi

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances npm..."
npm install --legacy-peer-deps

# Démarrer Docker si disponible
if [ "$HAS_DOCKER" = true ]; then
  echo ""
  echo "🐳 Démarrage de PostgreSQL et Redis via Docker..."
  docker-compose up -d db redis
  echo "⏳ Attente du démarrage des services (5s)..."
  sleep 5
fi

# Générer le client Prisma
echo ""
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Push du schéma
echo ""
echo "🗄️  Push du schéma vers la base de données..."
npx prisma db push

# Seed
echo ""
echo "🌱 Seed de la base de données..."
npm run db:seed

echo ""
echo "═══════════════════════════════════════════"
echo "✅ NexMart est configuré et prêt !"
echo ""
echo "📧 Admin : admin@nexmart.com / Admin@123456"
echo "📧 User  : user@nexmart.com  / User@123456"
echo ""
echo "▶️  Démarrer : npm run dev"
echo "🌐 URL      : http://localhost:3000"
echo "🔧 Admin    : http://localhost:3000/admin"
echo "═══════════════════════════════════════════"
echo ""

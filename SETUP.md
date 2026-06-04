# 🚀 NexMart — Guide de lancement rapide

## Prérequis

| Outil | Version min | Installation |
|-------|------------|-------------|
| Node.js | 20+ | https://nodejs.org |
| Docker Desktop | 24+ | https://docker.com |
| Git | 2.40+ | https://git-scm.com |
| VS Code | 1.88+ | https://code.visualstudio.com |

---

## ⚡ Démarrage en 5 étapes

### Étape 1 — Ouvrir dans VS Code

```bash
cd nexmart
code nexmart.code-workspace
```

Quand VS Code demande « Installer les extensions recommandées ? » → cliquer **Installer tout**.

---

### Étape 2 — Variables d'environnement

```bash
cp .env.example .env.local
```

Ouvrir `.env.local` et remplir :

```env
# Obligatoire pour démarrer
# Neon example:
# DATABASE_URL=postgresql://<neon_user>:<neon_password>@<neon_host>:5432/<neon_database>?sslmode=require
DATABASE_URL=postgresql://<neon_user>:<neon_password>@<neon_host>:5432/<neon_database>?sslmode=require
REDIS_URL=redis://localhost:6379
JWT_SECRET=nexmart-super-secret-jwt-key-minimum-32-chars
JWT_REFRESH_SECRET=nexmart-refresh-secret-key-minimum-32-chars

# Stripe (tester avec les clés test)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (gratuit sur cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail ou Mailtrap pour le dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@gmail.com
SMTP_PASS=votre-app-password
```

---

### Étape 3 — Lancer l'infrastructure (Docker)

Si vous utilisez Neon pour PostgreSQL, vous n'avez pas besoin du service `db` local. Il suffit de lancer Redis pour le cache local.

```bash
# Lancer Redis seulement
docker-compose up -d redis

# Vérifier que tout est OK
docker-compose ps
```

Si vous souhaitez utiliser PostgreSQL local à la place de Neon :

```bash
docker-compose up -d db redis
```

Sortie attendue :
```
NAME              STATUS    PORTS
nexmart-db-1      running   0.0.0.0:5432->5432/tcp
nexmart-redis-1   running   0.0.0.0:6379->6379/tcp
```

---

### Étape 4 — Base de données + Installation

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Injecter les données de démo
npm run db:seed
```

Après le seed, vous verrez :
```
✅ Admin user: admin@nexmart.com
✅ Demo user: user@nexmart.com
✅ 8 categories seeded
✅ 12 products seeded
✅ 4 coupons seeded

📧 Admin login: admin@nexmart.com / Admin@123456
📧 User login:  user@nexmart.com  / User@123456
🎟️  Coupons: NEXMART10, WELCOME10, SAVE20, FREESHIP
```

---

### Étape 5 — Lancer l'application

**Terminal 1 — App Next.js :**
```bash
npm run dev
```

**Terminal 2 — Worker BullMQ (optionnel pour les emails) :**
```bash
npm run queue:worker
```

Ouvrir → **http://localhost:3000**

---

## 🎯 Raccourcis VS Code

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Shift+P` | Ouvrir la palette de commandes |
| `Ctrl+Shift+B` | Lancer la tâche par défaut (npm run dev) |
| `F5` | Démarrer le débogage |
| `Ctrl+P` | Rechercher un fichier |
| `Ctrl+Shift+G` | Ouvrir Git |
| `Ctrl+` ` | Nouveau terminal |

### Tâches disponibles (`Ctrl+Shift+B` ou `Terminal > Run Task`)

- **dev: start app** — `npm run dev`
- **dev: start worker** — `npm run queue:worker`
- **docker: start infra** — lance PostgreSQL + Redis
- **docker: start all services** — tout lancer
- **db: push schema** — synchroniser Prisma
- **db: seed data** — injecter les données
- **db: open studio** — Prisma Studio (UI pour la BDD)
- **🚀 FULL START** — tout lancer en séquence

---

## 🗂️ Structure des dossiers

```
nexmart/
├── .vscode/           ← Configs VS Code (settings, tasks, debug, extensions)
├── prisma/
│   ├── schema.prisma  ← Schéma de base de données (13 modèles)
│   └── seed.ts        ← Données de démo
├── src/
│   ├── app/           ← Next.js App Router
│   │   ├── api/       ← 32 routes API (auth, products, orders, admin…)
│   │   ├── admin/     ← Dashboard admin (5 pages)
│   │   ├── products/  ← Listing + page détail
│   │   ├── cart/      ← Panier complet
│   │   ├── checkout/  ← Checkout multi-étapes avec Stripe
│   │   ├── orders/    ← Historique + suivi commandes
│   │   ├── wishlist/  ← Liste de souhaits
│   │   ├── account/   ← Profil, adresses, sécurité
│   │   ├── search/    ← Résultats de recherche
│   │   ├── login/     ← Authentification
│   │   └── register/  ← Inscription
│   ├── components/    ← 19 composants React
│   │   ├── layout/    ← Navbar, Footer, SearchModal
│   │   ├── home/      ← Hero, FlashSale, Categories, etc.
│   │   ├── product/   ← ProductCard, Gallery, Reviews, etc.
│   │   ├── cart/      ← CartDrawer
│   │   ├── admin/     ← Composants dashboard
│   │   └── ui/        ← Skeleton, etc.
│   ├── lib/           ← Services (Prisma, Redis, Stripe, Auth…)
│   ├── store/         ← Zustand (cart, wishlist, auth, UI)
│   ├── hooks/         ← Hooks React personnalisés
│   ├── types/         ← Types TypeScript complets
│   ├── utils/         ← Formatters, helpers
│   ├── middleware.ts  ← Auth Edge Middleware
│   └── workers/       ← BullMQ worker process
├── docker-compose.yml ← PostgreSQL + Redis + services
├── Dockerfile         ← Build multi-stage production
├── .env.example       ← Template variables d'environnement
├── nexmart.code-workspace ← Fichier workspace VS Code
└── README.md          ← Documentation complète
```

---

## 🔗 URLs utiles en développement

| Service | URL | Description |
|---------|-----|-------------|
| App | http://localhost:3000 | Frontend Next.js |
| Admin | http://localhost:3000/admin | Dashboard admin |
| Prisma Studio | http://localhost:5555 | `npm run db:studio` |
| pgAdmin | http://localhost:5050 | `docker-compose --profile dev up -d` |
| Redis Commander | http://localhost:8081 | `docker-compose --profile dev up -d` |

---

## 🧪 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@nexmart.com | Admin@123456 |
| Utilisateur | user@nexmart.com | User@123456 |

### Cartes Stripe de test

| Carte | Numéro | Résultat |
|-------|--------|---------|
| Visa (succès) | 4242 4242 4242 4242 | Paiement réussi |
| Visa (refus) | 4000 0000 0000 0002 | Carte refusée |
| 3D Secure | 4000 0025 0000 3155 | Authentification requise |

Expiration : n'importe quelle date future · CVC : n'importe quel code à 3 chiffres

### Coupons de test

| Code | Réduction |
|------|-----------|
| NEXMART10 | 10% de remise |
| WELCOME10 | 10% première commande |
| SAVE20 | 20$ de remise (min. 100$) |
| FREESHIP | Livraison gratuite |

---

## 🐳 Commandes Docker utiles

```bash
# Voir les logs de l'app
docker-compose logs -f app

# Redémarrer un service
docker-compose restart db

# Arrêter tout
docker-compose down

# Arrêter et supprimer les volumes (reset BDD)
docker-compose down -v

# Lancer en production complète
docker-compose up -d
```

---

## 🛠️ Commandes de développement

```bash
# Démarrer en dev
npm run dev

# Build production
npm run build

# Démarrer en production (après build)
npm run start

# Vérification TypeScript
npm run type-check

# Linting
npm run lint

# BDD — générer le client Prisma
npm run db:generate

# BDD — synchroniser le schéma
npm run db:push

# BDD — migration (production)
npm run db:migrate

# BDD — ouvrir Prisma Studio
npm run db:studio

# BDD — injecter les données de démo
npm run db:seed

# Worker BullMQ
npm run queue:worker

# Docker — lancer tout
npm run docker:up

# Docker — arrêter tout
npm run docker:down
```

---

## ⚠️ Problèmes courants

### Port 3000 déjà utilisé
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Erreur de connexion à PostgreSQL
```bash
# Vérifier que Docker tourne
docker-compose ps
# Relancer la BDD
docker-compose restart db
```

### Erreur Prisma "table not found"
```bash
npm run db:push
npm run db:seed
```

### Module introuvable après git pull
```bash
npm install --legacy-peer-deps
npm run db:generate
```

### Erreur JWT "invalid signature"
Vérifier que `JWT_SECRET` dans `.env.local` fait minimum 32 caractères.


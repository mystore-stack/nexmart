# Vercel deployment (NexMart)

## 1) Connect repository
- Vercel Dashboard → **Add New** → Project → import this repo
- Framework: **Next.js** (it should auto-detect)

## 2) Build / Install commands
Recommended (also matches `vercel.json`):
- Install: `npm ci`
- Build: `npm run build`

> Note: `package.json` now runs `prisma generate` automatically via `prebuild`.

## 3) Required environment variables
Set these in Vercel → Project Settings → Environment Variables:

- `DATABASE_URL`
- `REDIS_URL` (only needed if you want queues/caching features that require Redis)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`

## 4) Deploy automatique (GitHub → Vercel)

**Déjà configuré** — le repo GitHub est connecté au projet Vercel **nexmart** :

| | |
|---|---|
| Repo | https://github.com/mystore-stack/nexmart |
| Projet Vercel | https://vercel.com/you-store-s-projects/nexmart |
| URL production | https://nexmart-ashy.vercel.app |
| Branche auto-deploy | `main` |

### Déclencher un déploiement

Chaque `git push` sur `main` déclenche automatiquement un build + deploy sur Vercel :

```powershell
git add .
git commit -m "votre message"
git push origin main
```

Suivez le déploiement dans le [dashboard Vercel](https://vercel.com/you-store-s-projects/nexmart) ou dans l’onglet **Deployments** du repo GitHub.

### Déploiement manuel (CLI)

```powershell
npx vercel link --project nexmart --yes
npx vercel deploy --prod
```

### CI GitHub Actions

`.github/workflows/deploy.yml` vérifie que le build passe en CI. Le déploiement réel est géré par l’intégration Git Vercel (pas besoin de `VERCEL_TOKEN` dans GitHub Secrets).


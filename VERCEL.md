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

Repo GitHub : https://github.com/mystore-stack/nexmart-ma1

1. Poussez le code (compte **mystore-stack**) :
   ```powershell
   .\scripts\push-github.ps1
   ```
2. Ajoutez le secret GitHub **VERCEL_TOKEN** :
   - Créez un token : https://vercel.com/account/tokens
   - Repo → Settings → Secrets → Actions → `VERCEL_TOKEN`
3. Chaque push sur `main` déclenche `.github/workflows/deploy.yml`

Alternative : Vercel → Project **nexmart-ma** → Settings → Git → connecter `mystore-stack/nexmart-ma1`.


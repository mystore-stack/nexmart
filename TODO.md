# TODO - Vercel deployment

- [x] Add Prisma generation before Next build (`prebuild` in package.json)
- [x] Replace GitHub Pages workflow with Vercel deploy workflow (`deploy.yml`)
- [x] Add `vercel.json` for Next.js settings
- [x] Add Vercel env var documentation (`VERCEL.md`)
- [ ] Run `npm run build` locally to confirm Prisma generation + Next build succeed
- [ ] Add GitHub secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `VERCEL_SCOPE`
- [ ] Add Vercel environment variables: `DATABASE_URL`, `JWT_*`, `STRIPE_*`, `CLOUDINARY_*`, `SMTP_*`, and optionally `REDIS_URL`
- [ ] Push to `main` and verify deployment on Vercel


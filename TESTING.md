Testing and CI
=============

Local prereqs
---------------
- Node 18+
- pnpm (optional, recommended to avoid registry pin issues)

Local run (recommended with pnpm)
-------------------------------
Install deps and Playwright browsers:

```powershell
npm install -g pnpm
pnpm install
pnpm dlx playwright install --with-deps
```

Build Storybook and run tests locally:

```powershell
pnpm run build-storybook
npx http-server storybook-static -p 9001 &
npx playwright test --config=playwright.config.ts
npx pa11y-ci
```

If `npm install` fails with Storybook registry errors, use `pnpm` (above) or push a branch and let GitHub Actions run the full checks in CI.

Trigger CI (recommended when local install is blocked)
---------------------------------------------------
Create a branch, commit changes, and push:

```powershell
git checkout -b feat/admin-userlist-delete
git add .
git commit -m "admin: add UserList delete confirmation + Playwright tests"
git push -u origin feat/admin-userlist-delete
```

The repo's GitHub Actions workflow `/.github/workflows/build-storybook.yml` will build Storybook and run Playwright + pa11y.

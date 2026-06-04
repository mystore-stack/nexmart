# 🔐 GitHub Secrets Setup — NexMart

## كيفاش تضيف الـ Secrets في GitHub

### الخطوات
1. GitHub Repo → **Settings**
2. **Secrets and variables** → **Actions**
3. **"New repository secret"**
4. أضف كل واحد من الأسرار التالية

---

## 🔴 Secrets إجبارية (بلا ما تشغل الـ Workflows)

| Secret | من أين تجيبه | مثال |
|--------|-------------|------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens | `xxxxxxxxxxxxxxxx` |
| `VERCEL_ORG_ID` | vercel.com → Settings → General | `team_xxxxxxxxxx` |
| `VERCEL_PROJECT_ID` | vercel.com → Project → Settings | `prj_xxxxxxxxxx` |
| `DATABASE_URL` | Neon dashboard | `postgresql://...` |
| `NEXTAUTH_SECRET` | generate-secret.vercel.app/32 | `a8f3b2e9...` |
| `NEXTAUTH_URL` | رابط موقعك | `https://nexmart.ma` |
| `JWT_SECRET` | أي string طويلة | `my-super-secret-jwt-key-32chars` |
| `JWT_REFRESH_SECRET` | أي string طويلة | `my-refresh-secret-key-32chars` |

## 🟡 Secrets اختيارية

| Secret | لـ ماذا |
|--------|---------|
| `ANTHROPIC_API_KEY` | AI Chat + Search |
| `STRIPE_SECRET_KEY` | الدفع |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks |
| `CLOUDINARY_CLOUD_NAME` | رفع الصور |
| `CLOUDINARY_API_KEY` | رفع الصور |
| `CLOUDINARY_API_SECRET` | رفع الصور |

---

## 🔑 كيفاش تحصل على VERCEL_TOKEN

1. → https://vercel.com/account/tokens
2. **"Create Token"**
3. اسم: `GitHub Actions NexMart`
4. Scope: **Full Account**
5. انسخ الـ Token مباشرة (مرة واحدة فقط!)

## 🔑 كيفاش تحصل على VERCEL_ORG_ID و PROJECT_ID

```bash
# في مجلد المشروع
npx vercel link
cat .vercel/project.json
# ستجد: orgId و projectId
```


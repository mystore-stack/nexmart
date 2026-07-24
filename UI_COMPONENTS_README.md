NexMart UI Component Library — Minimal Deliverable
===============================================

What I implemented:

- Design tokens: `src/components/ui/tokens.ts` (CSS variables helper `applyCssVariables()`)
- Theme provider: `src/components/ui/ThemeProvider.tsx`
- Core primitives: `Button`, `Card`, `Typography` in `src/components/ui/`
- Navigation: `Navbar`, `MegaMenu`, `SearchBar`
- Commerce components: `HeroCarousel`, `ProductCard`, `CategoryCard`, `PromotionBanner`
- Showcase: `src/components/ui/Showcase.tsx` — a demo page composing the components

How to preview locally:

1. Ensure dependencies are installed (Next.js + Tailwind if used in this repo). From project root run:

```bash
npm install
npm run dev
```

2. The repository uses Next.js app router. To view the `Showcase` component quickly, import and render it in an existing page (for example in `app/page.tsx` or `page.tsx`) like:

```tsx
import Showcase from './src/components/ui/Showcase';

export default function Page(){
  return <Showcase />;
}
```

Notes and next steps I recommend:

- Add Storybook for interactive component documentation and visual tests.
- Add accessible keyboard interactions for `MegaMenu`, `Carousel`, and `Navbar` (aria roles, focus trap when open).
- Implement `CartDrawer`, `CheckoutStepper`, admin components, and more commerce primitives.
- Add unit and visual regression tests.
- Integrate motion library (Framer Motion) for polished micro-interactions.

Files created/modified (key paths):

- `src/components/ui/tokens.ts`
- `src/components/ui/ThemeProvider.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Typography.tsx`
- `src/components/ui/index.ts`
- `src/components/ui/SearchBar.tsx`
- `src/components/ui/MegaMenu.tsx`
- `src/components/ui/Navbar.tsx`
- `src/components/ui/HeroCarousel.tsx`
- `src/components/ui/ProductCard.tsx`
- `src/components/ui/CategoryCard.tsx`
- `src/components/ui/PromotionBanner.tsx`
- `src/components/ui/Showcase.tsx`

If you'd like, I can now:

- Set up Storybook and add stories for each component, or
- Build `CartDrawer` and `CheckoutStepper` and wire optimistic UI flows, or
- Start accessibility and performance audits and implement fixes.

Tell me which path to take next and I'll continue.

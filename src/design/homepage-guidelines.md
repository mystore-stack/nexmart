Design system et maquettes hi-fi — NexMart Morocco (Luxury)

But: ce fichier contient les guidelines visuelles et les spécifications pour chaque section demandée.

Principes généraux
- Style: Minimal Luxury
- Palette: Primary Emerald #0D7A5E, Accent Gold #C89B3C, Background white, Footer dark
- Typographie: Playfair Display (heading), Inter (body)
- Espacement généreux, coins arrondis, ombres subtiles

Structure globale (desktop)
- Barre d'annonce premium: bandeau fin, texte centré ou aligné à gauche, background transparent, élément CTA discret.
- Header sticky: translucide, logo à gauche, navigation principale centré, utilitaires (search, cart, wishlist) à droite. Hauteur réduite sur scroll.
- Hero: pleine largeur avec image premium, overlay sombre léger, titre Playfair Display large, sous-texte, CTA primaire gold-outline, CTA secondaire ghost.
- Categories: grille 4/5 cartes, images grandes, card hover lift, badge category.
- Flash Deals: countdown, carousel produit premium, badges or, stock indicator.
- Featured Products, Trending, New Arrivals: cards variants "luxury" (large image, wishlist, rating, price row, quick-add), grid 4-col desktop, 2-col mobile.
- Collections & Brands: horizontal scroller with brand marks, large tiles for collections.
- AI Recommendations: personalized row with rounded cards and subtle micro-interactions.
- Testimonials: serif quotes, portrait thumbnails, 3-up on desktop.
- Newsletter: centered card on luxury dark backdrop with gold CTA.
- Instagram Gallery: 6-image mosaic, live links to posts.
- Footer: 5 columns, dark background, gold accents, legal links, payment marks, newsletter compact.

Spécifications par section (desktop/tablet/mobile)
- Premium Announcement Bar
  - Height: 40px
  - Background: rgba(13,122,94,0.06)
  - Text: Inter 14px, semibold
  - CTA: small gold badge

- Luxury Sticky Header
  - Height: 76px (desktop), 60px (mobile)
  - Background: rgba(255,255,255,0.9)
  - Logo: 48px height
  - Search: compact centered on desktop

- Premium Hero
  - Height: 72vh desktop, 48vh mobile
  - Heading: Playfair Display 56-72px desktop
  - Buttons: primary emerald filled, secondary gold-outline

[...]

Contenu démo
- Utiliser images Unsplash premium pour remplir les bannières et cards. Exemples: https://images.unsplash.com/photo-1491933382434-500287f9b54b
- Générer produits démo si le CMS est vide (voir src/lib/home-data pour fallback)

Livrables
- Fichier CSS tokens existant: src/styles/design-tokens.css
- Nouveau thème: src/lib/themes/default-themes.ts (V5_LUXURY_MOROCCO)
- Exemples d'implémentation: components dans src/components/home/* à mettre à jour pour utiliser tokens

Notes d'intégration
- Ne pas modifier les IDs de sections utilisés par le Homepage Builder. Modifier uniquement les composants visuels et styles.

const fs = require('fs');
const path = require('path');
const root = process.cwd();
const targets = [
  {
    file: path.join(root, 'src', 'lib', 'cms', 'constants.ts'),
    old: `export const HOMEPAGE_SECTION_META: Record<
  HomepageSectionType,
  { label: string; description: string; icon: string }
> = {
  HERO: { label: "Hero", description: "Full-width hero banner carousel", icon: "Image" },
  FEATURED_PRODUCTS: { label: "Featured Products", description: "Curated product grid", icon: "ShoppingBag" },
  CATEGORIES: { label: "Categories", description: "Category showcase grid", icon: "Grid3x3" },
  FLASH_DEALS: { label: "Flash Deals", description: "Time-limited offers", icon: "Zap" },
  NEW_ARRIVALS: { label: "New Arrivals", description: "Latest products", icon: "Sparkles" },
  BRANDS: { label: "Brands", description: "Brand logo carousel", icon: "Award" },
  TESTIMONIALS: { label: "Testimonials", description: "Customer reviews", icon: "Quote" },
  FAQ: { label: "FAQ", description: "Frequently asked questions", icon: "HelpCircle" },
  NEWSLETTER: { label: "Newsletter", description: "Email signup CTA", icon: "Mail" },
  CUSTOM_HTML: { label: "Custom HTML", description: "Raw HTML block", icon: "Code" },
  AI_RECOMMENDATIONS: { label: "AI Recommendations", description: "Personalized product picks", icon: "Bot" },
};
`,
    new: `export const HOMEPAGE_SECTION_META: Record<
  HomepageSectionType,
  { label: string; description: string; icon: string }
> = {
  HERO: { label: "Hero", description: "Full-width hero banner carousel", icon: "Image" },
  CATEGORIES: { label: "Categories", description: "Category showcase grid", icon: "Grid3x3" },
  FLASH_DEALS: { label: "Flash Deals", description: "Time-limited offers", icon: "Zap" },
  BUNDLE_DEALS: { label: "Bundle Deals", description: "Curated bundle offers", icon: "Package" },
  MYSTERY_BOXES: { label: "Mystery Boxes", description: "Surprise product bundles", icon: "Gift" },
  FEATURED_PRODUCTS: { label: "Featured Products", description: "Curated product grid", icon: "ShoppingBag" },
  AI_RECOMMENDATIONS: { label: "AI Recommendations", description: "Personalized product picks", icon: "Bot" },
  BEST_SELLERS: { label: "Best Sellers", description: "Top-selling products", icon: "TrendingUp" },
  BRANDS: { label: "Partner Brands", description: "Brand logo carousel", icon: "Award" },
  WHY_NEXMART: { label: "Why NexMart", description: "Brand value and trust section", icon: "Sparkles" },
  TESTIMONIALS: { label: "Testimonials", description: "Customer reviews", icon: "Quote" },
  MOBILE_APP: { label: "Mobile App", description: "Mobile app promotion banner", icon: "Smartphone" },
  NEWSLETTER: { label: "Newsletter", description: "Email signup CTA", icon: "Mail" },
  FOOTER: { label: "Footer", description: "Site footer content and links", icon: "PanelBottom" },
};
`,
  },
  {
    file: path.join(root, 'src', 'lib', 'cms', 'constants.ts'),
    old: `export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionType[] = [
  "HERO",
  "CATEGORIES",
  "FEATURED_PRODUCTS",
  "FLASH_DEALS",
  "NEW_ARRIVALS",
  "BRANDS",
  "TESTIMONIALS",
  "NEWSLETTER",
];
`,
    new: `export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionType[] = [
  "HERO",
  "CATEGORIES",
  "FLASH_DEALS",
  "BUNDLE_DEALS",
  "MYSTERY_BOXES",
  "FEATURED_PRODUCTS",
  "AI_RECOMMENDATIONS",
  "BEST_SELLERS",
  "BRANDS",
  "WHY_NEXMART",
  "TESTIMONIALS",
  "MOBILE_APP",
  "NEWSLETTER",
  "FOOTER",
];
`,
  },
  {
    file: path.join(root, 'src', 'lib', 'cms', 'schemas', 'homepage.ts'),
    old: `export const homepageSectionTypeSchema = z.enum([
  "HERO",
  "FEATURED_PRODUCTS",
  "CATEGORIES",
  "FLASH_DEALS",
  "NEW_ARRIVALS",
  "BRANDS",
  "TESTIMONIALS",
  "FAQ",
  "NEWSLETTER",
  "CUSTOM_HTML",
  "AI_RECOMMENDATIONS",
]);
`,
    new: `export const homepageSectionTypeSchema = z.enum([
  "HERO",
  "CATEGORIES",
  "FLASH_DEALS",
  "BUNDLE_DEALS",
  "MYSTERY_BOXES",
  "FEATURED_PRODUCTS",
  "AI_RECOMMENDATIONS",
  "BEST_SELLERS",
  "BRANDS",
  "WHY_NEXMART",
  "TESTIMONIALS",
  "MOBILE_APP",
  "NEWSLETTER",
  "FOOTER",
]);
`,
  },
  {
    file: path.join(root, 'src', 'app', 'api', 'admin', 'cms', 'homepage-sections', 'route.ts'),
    old: `const DEFAULT_SECTIONS = [
  { sectionKey: "hero", title: "Hero", description: "Bannière principale et CTA", destinationUrl: "/" },
  { sectionKey: "categories", title: "Catégories", description: "Ordre, visibilité et images des catégories homepage", destinationUrl: "/categories" },
  { sectionKey: "promotionalCards", title: "Cartes Promo", description: "Bannières promotionnelles et collections spéciales", destinationUrl: "/promotions" },
  { sectionKey: "flashDeals", title: "Ventes Flash", description: "Articles en promotion avec compte à rebours", destinationUrl: "/collections/flash-deals", viewAllButton: "Voir toutes les offres" },
  { sectionKey: "flashSale", title: "Flash Sale", description: "Offres flash dans la section vente du jour", destinationUrl: "/deals", viewAllButton: "Voir tout" },
  { sectionKey: "serviceBanners", title: "Bannières Service", description: "Livraison express et paiement à la livraison", destinationUrl: "/services" },
  { sectionKey: "showcaseGrid", title: "Showcase Grid", description: "Meilleures ventes, nouveautés, mystery boxes", destinationUrl: "/collections" },
  { sectionKey: "bundleBuilder", title: "Bundle Builder", description: "Création de packs et réductions packagées", destinationUrl: "/bundles", viewAllButton: "Créer un bundle" },
  { sectionKey: "buyMoreSaveMore", title: "Buy More Save More", description: "Offres cumulatives et réductions progressives", destinationUrl: "/deals/buy-more-save-more", viewAllButton: "Voir toutes les offres" },
  { sectionKey: "recommended", title: "Recommended For You", description: "Produits recommandés personnalisés", destinationUrl: "/collections/recommended", viewAllButton: "Voir tout" },
  { sectionKey: "brandCarousel", title: "Marques Partenaires", description: "Carousel des partenaires et marques premium", destinationUrl: "/brands" },
  { sectionKey: "featuredProducts", title: "Produits en Vedette", description: "Sélection premium de produits mis en avant", destinationUrl: "/collections/featured", viewAllButton: "Voir tout" },
  { sectionKey: "promoBanner", title: "Promo Banner", description: "Bannière marketing secondaire", destinationUrl: "/promotions" },
  { sectionKey: "trendingProducts", title: "Tendances", description: "Produits populaires et tendances du moment", destinationUrl: "/collections/trending", viewAllButton: "Voir tout" },
  { sectionKey: "recentlyViewed", title: "Historique de Navigation", description: "Produits récemment consultés", destinationUrl: "/account/history" },
  { sectionKey: "whyNexMart", title: "Pourquoi NexMart", description: "Section de confiance et différenciation de marque", destinationUrl: "/about" },
  { sectionKey: "featuresBar", title: "Barre d'Avantages", description: "Livraison, paiement sécurisé, support client", destinationUrl: "/services" },
  { sectionKey: "mobileAppBanner", title: "Promotion Mobile", description: "Encourager le téléchargement de l'app mobile", destinationUrl: "/app" },
  { sectionKey: "newsletter", title: "Newsletter", description: "Inscription à la newsletter premium", destinationUrl: "/newsletter" },
];
`,
    new: `const DEFAULT_SECTIONS = [
  { sectionKey: "hero", title: "Hero", description: "Bannière principale et CTA", destinationUrl: "/" },
  { sectionKey: "categories", title: "Catégories", description: "Ordre, visibilité et images des catégories homepage", destinationUrl: "/categories" },
  { sectionKey: "flashSale", title: "Flash Sale", description: "Offres flash dans la section vente du jour", destinationUrl: "/deals", viewAllButton: "Voir tout" },
  { sectionKey: "megaPromo", title: "Mega Promo", description: "Offre premium à fort impact visuel", destinationUrl: "/promotions" },
  { sectionKey: "serviceBanners", title: "Service Banners", description: "Livraison express et paiement à la livraison", destinationUrl: "/services" },
  { sectionKey: "showcaseGrid", title: "Showcase Grid", description: "Meilleures ventes, nouveautés et collections premium", destinationUrl: "/collections" },
  { sectionKey: "bundleBuilder", title: "Bundle Builder", description: "Création de packs et réductions packagées", destinationUrl: "/bundles", viewAllButton: "Créer un bundle" },
  { sectionKey: "recommended", title: "Recommended For You", description: "Produits recommandés personnalisés", destinationUrl: "/collections/recommended", viewAllButton: "Voir tout" },
  { sectionKey: "brandCarousel", title: "Marques Partenaires", description: "Carousel des partenaires et marques premium", destinationUrl: "/brands" },
  { sectionKey: "featuredProducts", title: "Produits en Vedette", description: "Sélection premium de produits mis en avant", destinationUrl: "/collections/featured", viewAllButton: "Voir tout" },
  { sectionKey: "trendingProducts", title: "Tendances", description: "Produits populaires et tendances du moment", destinationUrl: "/collections/trending", viewAllButton: "Voir tout" },
  { sectionKey: "mobileAppBanner", title: "Promotion Mobile", description: "Encourager le téléchargement de l'app mobile", destinationUrl: "/app" },
  { sectionKey: "newsletter", title: "Newsletter", description: "Inscription à la newsletter premium", destinationUrl: "/newsletter" },
];
`,
  }
];
for (const { file, old, new: newText } of targets) {
  if (!fs.existsSync(file)) {
    console.error('Missing file:', file);
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(old)) {
    fs.writeFileSync(file, text.replace(old, newText), 'utf8');
    console.log('Updated', file);
  } else {
    console.log('Old block not found in', file);
  }
}

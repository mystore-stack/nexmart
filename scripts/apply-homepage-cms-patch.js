const fs = require('fs');
const path = require('path');
const root = process.cwd();
const targets = [
  {
    file: path.join(root, 'src', 'lib', 'cms', 'constants.ts'),
    regex: /export const HOMEPAGE_SECTION_META:[\s\S]*?};\r?\n/, 
    replace: `export const HOMEPAGE_SECTION_META: Record<
  HomepageSectionType,
  { label: string; description: string; icon: string }
> = {
  HERO: { label: "Hero", description: "Full-width hero banner carousel", icon: "Image" },
  FEATURED_PRODUCTS: { label: "Featured Products", description: "Curated product grid", icon: "ShoppingBag" },
  CATEGORIES: { label: "Categories", description: "Category showcase grid", icon: "Grid3x3" },
  FLASH_DEALS: { label: "Flash Deals", description: "Time-limited offers", icon: "Zap" },
  BUNDLE_DEALS: { label: "Bundle Deals", description: "Curated bundle offers", icon: "Package" },
  MYSTERY_BOXES: { label: "Mystery Boxes", description: "Surprise product bundles", icon: "Gift" },
  AI_RECOMMENDATIONS: { label: "AI Recommendations", description: "Personalized product picks", icon: "Bot" },
  BEST_SELLERS: { label: "Best Sellers", description: "Top-selling products", icon: "TrendingUp" },
  BRANDS: { label: "Partner Brands", description: "Brand logo carousel", icon: "Award" },
  WHY_NEXMART: { label: "Why NexMart", description: "Brand value and trust section", icon: "Sparkles" },
  TESTIMONIALS: { label: "Testimonials", description: "Customer reviews", icon: "Quote" },
  MOBILE_APP: { label: "Mobile App", description: "Mobile app promotion banner", icon: "Smartphone" },
  NEWSLETTER: { label: "Newsletter", description: "Email signup CTA", icon: "Mail" },
  FOOTER: { label: "Footer", description: "Site footer content and links", icon: "PanelBottom" },
};\n`,
  },
  {
    file: path.join(root, 'src', 'lib', 'cms', 'constants.ts'),
    regex: /export const DEFAULT_HOMEPAGE_SECTIONS:[\s\S]*?];\r?\n/, 
    replace: `export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionType[] = [
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
];\n`,
  },
  {
    file: path.join(root, 'src', 'lib', 'cms', 'schemas', 'homepage.ts'),
    regex: /export const homepageSectionTypeSchema = z\.enum\([\s\S]*?\);\r?\n/, 
    replace: `export const homepageSectionTypeSchema = z.enum([
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
]);\n`,
  },
  {
    file: path.join(root, 'src', 'app', 'api', 'admin', 'cms', 'homepage-sections', 'route.ts'),
    regex: /const DEFAULT_SECTIONS = \[[\s\S]*?\];\r?\n/, 
    replace: `const DEFAULT_SECTIONS = [
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
];\n`,
  }
];
for (const target of targets) {
  if (!fs.existsSync(target.file)) {
    console.error('Missing file:', target.file);
    continue;
  }
  let content = fs.readFileSync(target.file, 'utf8');
  if (target.regex.test(content)) {
    content = content.replace(target.regex, target.replace);
    fs.writeFileSync(target.file, content, 'utf8');
    console.log('Updated', target.file);
  } else {
    console.warn('Pattern not found in', target.file);
  }
}

import type { SectionConfig, PageSection } from "../types";
import { HeroSliderSection } from "../sections/HeroSliderSection";
import { CategoriesSection } from "../sections/CategoriesSection";
import { FlashDealsSection } from "../sections/FlashDealsSection";
import { CampaignBannerSection } from "../sections/CampaignBannerSection";
import { NewArrivalsSection } from "../sections/NewArrivalsSection";
import { BestSellersSection } from "../sections/BestSellersSection";
import { MysteryBoxesSection } from "../sections/MysteryBoxesSection";
import { BuyMoreSaveMoreSection } from "../sections/BuyMoreSaveMoreSection";
import { FrequentlyBoughtTogetherSection } from "../sections/FrequentlyBoughtTogetherSection";
import { BuildYourOwnBundleSection } from "../sections/BuildYourOwnBundleSection";
import { BrandShowcaseSection } from "../sections/BrandShowcaseSection";
import { VideoBannerSection } from "../sections/VideoBannerSection";
import { CollectionGridSection } from "../sections/CollectionGridSection";
import { TrendingProductsSection } from "../sections/TrendingProductsSection";
import { RecommendedProductsSection } from "../sections/RecommendedProductsSection";
import { RecentlyViewedSection } from "../sections/RecentlyViewedSection";
import { RecentlyAddedSection } from "../sections/RecentlyAddedSection";
import { PopularSearchesSection } from "../sections/PopularSearchesSection";
import { InstagramFeedSection } from "../sections/InstagramFeedSection";
import { BlogPostsSection } from "../sections/BlogPostsSection";
import { TrustBadgesSection } from "../sections/TrustBadgesSection";
import { ShippingBenefitsSection } from "../sections/ShippingBenefitsSection";
import { CountdownOfferSection } from "../sections/CountdownOfferSection";
import { FooterBannerSection } from "../sections/FooterBannerSection";
import { HeroSection } from "../sections/HeroSection";
import { AnnouncementBarSection } from "../sections/AnnouncementBarSection";
import { NewsletterSection } from "../sections/NewsletterSection";
import { ProductCarouselSection } from "../sections/ProductCarouselSection";
import { FeaturedProductsSection } from "../sections/FeaturedProductsSection";
import { SpacerSection } from "../sections/SpacerSection";
import { DividerSection } from "../sections/DividerSection";
import { IconGridSection } from "../sections/IconGridSection";
import { BrandLogosSection } from "../sections/BrandLogosSection";
import { RichTextSection } from "../sections/RichTextSection";
import { FeaturedCategoriesSection } from "../sections/FeaturedCategoriesSection";
import { TestimonialsSection } from "../sections/TestimonialsSection";
import { FAQSection } from "../sections/FAQSection";
import { VideoSection } from "../sections/VideoSection";
import { ImageGallerySection } from "../sections/ImageGallerySection";
import { PromotionalBannerSection } from "../sections/PromotionalBannerSection";
import { CustomHTMLSection } from "../sections/CustomHTMLSection";
import { CTABannerSection } from "../sections/CTABannerSection";
import { BenefitsSection } from "../sections/BenefitsSection";
import { CountdownTimerSection } from "../sections/CountdownTimerSection";
import { ProductGridSection } from "../sections/ProductGridSection";
import { TextBlockSection } from "../sections/TextBlockSection";
import { CTASection } from "../sections/CTASection";

export type SectionCategory =
  | "Marketing"
  | "Products"
  | "Content"
  | "Media"
  | "Layout"
  | "Commerce"
  | "Conversion"
  | "Trust"
  | "Utility"
  | "Social";

export interface SectionDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  categories: SectionCategory[];
  previewImage?: string;
  component: React.ComponentType<{ section: PageSection; products?: any[]; isLoading?: boolean }>;
  defaultConfig: SectionConfig;
  tags: string[];
  keywords: string[];
  popular?: boolean;
  isNew?: boolean;
}

export const SECTION_CATEGORIES: SectionCategory[] = [
  "Marketing",
  "Products",
  "Content",
  "Media",
  "Layout",
  "Commerce",
  "Conversion",
  "Trust",
  "Utility",
];

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    id: "hero",
    name: "Hero Section",
    description: "Full-width hero with background, overlay, badge, title, subtitle, and CTA buttons",
    icon: "Layout",
    categories: ["Marketing", "Conversion"],
    popular: true,
    component: HeroSection,
    defaultConfig: {
      title: "Welcome to Our Store",
      subtitle: "Discover premium Moroccan luxury products",
      badge: "New Collection",
      badgeBgColor: "#0F766E",
      badgeTextColor: "#FFFFFF",
      backgroundColor: "#0F766E",
      backgroundImage: "",
      overlayColor: "#000000",
      overlayOpacity: 0.3,
      textColor: "#FFFFFF",
      textAlign: "center",
      buttons: [
        {
          text: "Shop Now",
          link: "/shop",
          bgColor: "#FFFFFF",
          textColor: "#0F766E",
          showArrow: true,
        },
        {
          text: "Learn More",
          link: "/about",
          bgColor: "transparent",
          textColor: "#FFFFFF",
          showArrow: false,
        },
      ],
    },
    tags: ["hero", "banner", "landing", "featured"],
    keywords: ["hero", "banner", "landing", "header", "main", "featured"],
  },
  {
    id: "announcement-bar",
    name: "Announcement Bar",
    description: "Top announcement bar with text and close button",
    icon: "Megaphone",
    categories: ["Marketing", "Utility"],
    component: AnnouncementBarSection,
    defaultConfig: {
      title: "Free shipping on orders over 500 MAD",
      backgroundColor: "#0F766E",
      textColor: "#FFFFFF",
      textAlign: "center",
    },
    tags: ["announcement", "banner", "notification", "promo"],
    keywords: ["announcement", "banner", "notification", "promo", "top bar"],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Email subscription form with heading and description",
    icon: "Mail",
    categories: ["Marketing", "Conversion"],
    popular: true,
    component: NewsletterSection,
    defaultConfig: {
      title: "Subscribe to Our Newsletter",
      subtitle: "Get exclusive offers and updates delivered to your inbox",
      buttonText: "Subscribe",
      buttonBgColor: "#0F766E",
      buttonTextColor: "#FFFFFF",
      backgroundColor: "#F3F4F6",
      textColor: "#111827",
    },
    tags: ["newsletter", "email", "subscription", "form"],
    keywords: ["newsletter", "email", "subscribe", "form", "signup"],
  },
  {
    id: "product-carousel",
    name: "Product Carousel",
    description: "Horizontal scrolling product carousel with cards",
    icon: "ShoppingCart",
    categories: ["Products", "Commerce"],
    popular: true,
    component: ProductCarouselSection,
    defaultConfig: {
      title: "Featured Products",
      subtitle: "Browse our best-selling items",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      columns: 4,
    },
    tags: ["products", "carousel", "slider", "ecommerce"],
    keywords: ["products", "carousel", "slider", "ecommerce", "shop"],
  },
  {
    id: "featured-products",
    name: "Featured Products",
    description: "Grid of featured products with images and prices",
    icon: "Star",
    categories: ["Products", "Commerce"],
    popular: true,
    component: FeaturedProductsSection,
    defaultConfig: {
      title: "Featured Products",
      subtitle: "Handpicked selections for you",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      columns: 4,
    },
    tags: ["products", "featured", "grid", "ecommerce"],
    keywords: ["products", "featured", "grid", "ecommerce", "best sellers"],
  },
  {
    id: "spacer",
    name: "Spacer",
    description: "Adjustable vertical spacing between sections",
    icon: "Minus",
    categories: ["Layout", "Utility"],
    component: SpacerSection,
    defaultConfig: {
      height: 64,
      backgroundColor: "transparent",
    },
    tags: ["spacer", "spacing", "layout", "gap"],
    keywords: ["spacer", "spacing", "gap", "separator", "margin"],
  },
  {
    id: "divider",
    name: "Divider",
    description: "Horizontal line with customizable style and color",
    icon: "Minus",
    categories: ["Layout", "Utility"],
    component: DividerSection,
    defaultConfig: {
      height: 1,
      color: "#E5E7EB",
      style: "solid",
    },
    tags: ["divider", "separator", "line", "layout"],
    keywords: ["divider", "separator", "line", "horizontal", "border"],
  },
  {
    id: "icon-grid",
    name: "Icon Grid",
    description: "Grid of icons with labels for features or benefits",
    icon: "Grid",
    categories: ["Content", "Trust"],
    component: IconGridSection,
    defaultConfig: {
      title: "Our Features",
      subtitle: "What makes us different",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      columns: 3,
      icons: [
        { title: "Fast Shipping", description: "Quick delivery" },
        { title: "Secure Payment", description: "Safe transactions" },
        { title: "24/7 Support", description: "Always available" },
      ],
    },
    tags: ["icons", "features", "grid", "benefits"],
    keywords: ["icons", "features", "grid", "benefits", "services"],
  },
  {
    id: "brand-logos",
    name: "Brand Logos",
    description: "Display partner or client brand logos",
    icon: "Building2",
    categories: ["Trust", "Marketing"],
    component: BrandLogosSection,
    defaultConfig: {
      title: "Trusted by Leading Brands",
      backgroundColor: "#F9FAFB",
      textColor: "#111827",
      grayscale: true,
      logoHeight: "48px",
    },
    tags: ["brands", "logos", "partners", "trust"],
    keywords: ["brands", "logos", "partners", "clients", "trust"],
  },
  {
    id: "rich-text",
    name: "Rich Text",
    description: "HTML content block with customizable styling",
    icon: "Type",
    categories: ["Content"],
    component: RichTextSection,
    defaultConfig: {
      content: "<p>Your custom HTML content goes here.</p>",
      textAlign: "left",
      textColor: "#111827",
    },
    tags: ["text", "content", "html", "rich"],
    keywords: ["text", "content", "html", "rich", "editor"],
  },
  {
    id: "featured-categories",
    name: "Featured Categories",
    description: "Grid of category images with hover effects",
    icon: "Folder",
    categories: ["Products", "Commerce"],
    component: FeaturedCategoriesSection,
    defaultConfig: {
      title: "Shop by Category",
      subtitle: "Explore our collections",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      columns: 3,
    },
    tags: ["categories", "grid", "products", "navigation"],
    keywords: ["categories", "grid", "products", "navigation", "collections"],
  },
  {
    id: "testimonials",
    name: "Testimonials",
    description: "Customer reviews with ratings and avatars",
    icon: "MessageSquare",
    categories: ["Trust", "Marketing"],
    popular: true,
    component: TestimonialsSection,
    defaultConfig: {
      title: "What Our Customers Say",
      subtitle: "Real reviews from real customers",
      backgroundColor: "#F9FAFB",
      textColor: "#111827",
      columns: 3,
      cardBgColor: "#FFFFFF",
    },
    tags: ["testimonials", "reviews", "trust", "social proof"],
    keywords: ["testimonials", "reviews", "trust", "social proof", "feedback"],
  },
  {
    id: "faq",
    name: "FAQ",
    description: "Collapsible frequently asked questions",
    icon: "HelpCircle",
    categories: ["Content", "Utility"],
    component: FAQSection,
    defaultConfig: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
    },
    tags: ["faq", "questions", "help", "support"],
    keywords: ["faq", "questions", "help", "support", "answers"],
  },
  {
    id: "video",
    name: "Video",
    description: "Embedded video player for YouTube, Vimeo, or direct URLs",
    icon: "Video",
    categories: ["Media"],
    component: VideoSection,
    defaultConfig: {
      title: "Watch Our Story",
      subtitle: "Learn more about our brand",
      videoUrl: "",
      videoType: "youtube",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
    },
    tags: ["video", "media", "youtube", "vimeo"],
    keywords: ["video", "media", "youtube", "vimeo", "embed"],
  },
  {
    id: "image-gallery",
    name: "Image Gallery",
    description: "Responsive grid of images with captions",
    icon: "Image",
    categories: ["Media"],
    component: ImageGallerySection,
    defaultConfig: {
      title: "Gallery",
      subtitle: "Browse our collection",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      columns: 3,
    },
    tags: ["gallery", "images", "media", "grid"],
    keywords: ["gallery", "images", "media", "grid", "photos"],
  },
  {
    id: "promotional-banner",
    name: "Promotional Banner",
    description: "Full-width promotional banner with badge and buttons",
    icon: "Flag",
    categories: ["Marketing", "Conversion"],
    component: PromotionalBannerSection,
    defaultConfig: {
      title: "Special Offer",
      subtitle: "Get 20% off your first order",
      badge: "Limited Time",
      badgeBgColor: "#EF4444",
      badgeTextColor: "#FFFFFF",
      backgroundColor: "#0F766E",
      backgroundImage: "",
      overlayColor: "#000000",
      overlayOpacity: 0.3,
      textColor: "#FFFFFF",
      buttons: [
        {
          text: "Shop Now",
          link: "/shop",
          bgColor: "#FFFFFF",
          textColor: "#0F766E",
          showArrow: true,
        },
      ],
    },
    tags: ["banner", "promo", "offer", "marketing"],
    keywords: ["banner", "promo", "offer", "marketing", "sale"],
  },
  {
    id: "custom-html",
    name: "Custom HTML",
    description: "Insert custom HTML code for advanced customization",
    icon: "Code",
    categories: ["Utility"],
    component: CustomHTMLSection,
    defaultConfig: {
      html: "<div>Your custom HTML here</div>",
    },
    tags: ["html", "custom", "code", "advanced"],
    keywords: ["html", "custom", "code", "advanced", "embed"],
  },
  {
    id: "cta-banner",
    name: "CTA Banner",
    description: "Call-to-action banner with background and button",
    icon: "ArrowRight",
    categories: ["Conversion", "Marketing"],
    popular: true,
    component: CTABannerSection,
    defaultConfig: {
      title: "Ready to Get Started?",
      subtitle: "Join thousands of satisfied customers",
      buttonText: "Get Started",
      buttonLink: "/signup",
      buttonBgColor: "#FFFFFF",
      buttonTextColor: "#0F766E",
      backgroundColor: "#0F766E",
      backgroundImage: "",
      overlayColor: "#000000",
      overlayOpacity: 0.3,
      textColor: "#FFFFFF",
    },
    tags: ["cta", "call to action", "banner", "conversion"],
    keywords: ["cta", "call to action", "banner", "conversion", "signup"],
  },
  {
    id: "benefits",
    name: "Benefits",
    description: "Highlight key benefits with icons and descriptions",
    icon: "CheckCircle",
    categories: ["Trust", "Content"],
    component: BenefitsSection,
    defaultConfig: {
      title: "Why Choose Us",
      description: "Discover the benefits of shopping with us",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
    },
    tags: ["benefits", "features", "trust", "why us"],
    keywords: ["benefits", "features", "trust", "why us", "advantages"],
  },
  {
    id: "countdown-timer",
    name: "Countdown Timer",
    description: "Countdown to a specific date for promotions",
    icon: "Timer",
    categories: ["Marketing", "Conversion"],
    component: CountdownTimerSection,
    defaultConfig: {
      title: "Limited Time Offer",
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: "Don't miss out on this exclusive deal!",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
    },
    tags: ["countdown", "timer", "promo", "urgent"],
    keywords: ["countdown", "timer", "promo", "urgent", "deadline"],
  },
  {
    id: "product-grid",
    name: "Product Grid",
    description: "Responsive grid of products with pagination",
    icon: "Grid3x3",
    categories: ["Products", "Commerce"],
    component: ProductGridSection,
    defaultConfig: {
      title: "All Products",
      description: "Browse our complete collection",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
    },
    tags: ["products", "grid", "ecommerce", "catalog"],
    keywords: ["products", "grid", "ecommerce", "catalog", "shop"],
  },
  {
    id: "text-block",
    name: "Text Block",
    description: "Simple text content with heading and body",
    icon: "FileText",
    categories: ["Content"],
    component: TextBlockSection,
    defaultConfig: {
      title: "About Us",
      content: "<p>Your content goes here.</p>",
      textAlign: "left",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
    },
    tags: ["text", "content", "about", "info"],
    keywords: ["text", "content", "about", "info", "description"],
  },
  {
    id: "cta",
    name: "CTA Section",
    description: "Call-to-action section with background and button",
    icon: "Zap",
    categories: ["Conversion", "Marketing"],
    component: CTASection,
    defaultConfig: {
      title: "Start Your Journey",
      description: "Join us today and transform your experience",
      buttonText: "Get Started",
      link: "/signup",
      backgroundColor: "#0F766E",
      backgroundImage: "",
      overlayColor: "#000000",
      overlayOpacity: 0.3,
      textAlign: "center",
    },
    tags: ["cta", "call to action", "conversion", "signup"],
    keywords: ["cta", "call to action", "conversion", "signup", "action"],
  },
  // New Dynamic Home Page Builder Sections
  {
    id: "hero-slider",
    name: "Hero Banner Slider",
    description: "Multiple hero banners with auto-sliding",
    icon: "Image",
    categories: ["Marketing", "Conversion"],
    popular: true,
    isNew: true,
    component: HeroSliderSection,
    defaultConfig: {
      slides: [],
      autoplay: true,
      autoplaySpeed: 5000,
      showArrows: true,
      showDots: true,
      height: "600px",
      fullHeight: false,
    },
    tags: ["hero", "slider", "carousel", "banner"],
    keywords: ["hero", "slider", "carousel", "banner", "multiple"],
  },
  {
    id: "categories-grid",
    name: "Categories Grid",
    description: "Product categories display with grid layout",
    icon: "Grid",
    categories: ["Products", "Commerce"],
    popular: true,
    isNew: true,
    component: CategoriesSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showImage: true,
      showProductCount: true,
    },
    tags: ["categories", "grid", "products", "navigation"],
    keywords: ["categories", "grid", "products", "navigation", "collections"],
  },
  {
    id: "flash-deals",
    name: "Flash Deals",
    description: "Limited-time flash deals with countdown",
    icon: "Zap",
    categories: ["Marketing", "Commerce"],
    popular: true,
    isNew: true,
    component: FlashDealsSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showCountdown: true,
      showDiscount: true,
    },
    tags: ["flash deals", "promo", "countdown", "limited time"],
    keywords: ["flash deals", "promo", "countdown", "limited time", "urgent"],
  },
  {
    id: "campaign-banner",
    name: "Campaign Banner",
    description: "Full-width promotional campaign banner",
    icon: "Megaphone",
    categories: ["Marketing", "Conversion"],
    isNew: true,
    component: CampaignBannerSection,
    defaultConfig: {
      image: "",
      fullWidth: true,
      overlayColor: "rgba(0,0,0,0.3)",
      overlayOpacity: 0.3,
    },
    tags: ["banner", "campaign", "promo", "marketing"],
    keywords: ["banner", "campaign", "promo", "marketing", "full width"],
  },
  {
    id: "new-arrivals",
    name: "New Arrivals",
    description: "Latest products added to store",
    icon: "Sparkles",
    categories: ["Products", "Commerce"],
    isNew: true,
    component: NewArrivalsSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showDate: true,
    },
    tags: ["new arrivals", "products", "latest", "new"],
    keywords: ["new arrivals", "products", "latest", "new", "recent"],
  },
  {
    id: "best-sellers",
    name: "Best Sellers",
    description: "Top-selling products",
    icon: "TrendingUp",
    categories: ["Products", "Commerce"],
    popular: true,
    isNew: true,
    component: BestSellersSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showSalesCount: true,
    },
    tags: ["best sellers", "products", "top", "popular"],
    keywords: ["best sellers", "products", "top", "popular", "trending"],
  },
  {
    id: "mystery-boxes",
    name: "Mystery Boxes",
    description: "Surprise bundle boxes",
    icon: "Gift",
    categories: ["Commerce", "Marketing"],
    isNew: true,
    component: MysteryBoxesSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showStock: true,
    },
    tags: ["mystery boxes", "bundles", "surprise", "gifts"],
    keywords: ["mystery boxes", "bundles", "surprise", "gifts", "random"],
  },
  {
    id: "buy-more-save-more",
    name: "Buy More Save More",
    description: "Volume discount bundles",
    icon: "Percent",
    categories: ["Commerce", "Marketing"],
    isNew: true,
    component: BuyMoreSaveMoreSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showRules: true,
    },
    tags: ["buy more save more", "volume discount", "bundles"],
    keywords: ["buy more save more", "volume discount", "bundles", "bulk"],
  },
  {
    id: "frequently-bought-together",
    name: "Frequently Bought Together",
    description: "Product bundles based on purchase patterns",
    icon: "Package",
    categories: ["Commerce", "Marketing"],
    isNew: true,
    component: FrequentlyBoughtTogetherSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showDiscount: true,
    },
    tags: ["frequently bought together", "bundles", "cross-sell"],
    keywords: ["frequently bought together", "bundles", "cross-sell", "related"],
  },
  {
    id: "build-your-own-bundle",
    name: "Build Your Own Bundle",
    description: "Custom bundle builder",
    icon: "Layers",
    categories: ["Commerce", "Marketing"],
    isNew: true,
    component: BuildYourOwnBundleSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showDiscountTiers: true,
    },
    tags: ["build your own bundle", "custom bundle", "builder"],
    keywords: ["build your own bundle", "custom bundle", "builder", "create"],
  },
  {
    id: "brand-showcase",
    name: "Brand Showcase",
    description: "Featured brands display",
    icon: "Badge",
    categories: ["Trust", "Marketing"],
    isNew: true,
    component: BrandShowcaseSection,
    defaultConfig: {
      layout: "carousel",
      columns: 6,
      showDescription: true,
    },
    tags: ["brands", "showcase", "featured", "partners"],
    keywords: ["brands", "showcase", "featured", "partners", "logos"],
  },
  {
    id: "video-banner",
    name: "Video Banner",
    description: "Video background section",
    icon: "Video",
    categories: ["Media", "Marketing"],
    isNew: true,
    component: VideoBannerSection,
    defaultConfig: {
      videoUrl: "",
      autoplay: true,
      muted: true,
      loop: true,
      controls: false,
    },
    tags: ["video", "banner", "background", "media"],
    keywords: ["video", "banner", "background", "media", "embed"],
  },
  {
    id: "collection-grid",
    name: "Collection Grid",
    description: "Product collections display",
    icon: "Folder",
    categories: ["Products", "Commerce"],
    isNew: true,
    component: CollectionGridSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showProductCount: true,
    },
    tags: ["collections", "grid", "products", "categories"],
    keywords: ["collections", "grid", "products", "categories", "groups"],
  },
  {
    id: "trending-products",
    name: "Trending Products",
    description: "Currently trending products",
    icon: "Flame",
    categories: ["Products", "Commerce"],
    isNew: true,
    component: TrendingProductsSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showTrendingScore: true,
    },
    tags: ["trending", "products", "popular", "hot"],
    keywords: ["trending", "products", "popular", "hot", "viral"],
  },
  {
    id: "recommended-products",
    name: "Recommended Products",
    description: "AI-recommended products",
    icon: "Brain",
    categories: ["Products", "Commerce"],
    isNew: true,
    component: RecommendedProductsSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showRecommendationReason: true,
    },
    tags: ["recommended", "products", "ai", "personalized"],
    keywords: ["recommended", "products", "ai", "personalized", "suggestions"],
  },
  {
    id: "recently-viewed",
    name: "Recently Viewed",
    description: "User's recently viewed products",
    icon: "Clock",
    categories: ["Products", "Utility"],
    isNew: true,
    component: RecentlyViewedSection,
    defaultConfig: {
      layout: "carousel",
      columns: 4,
      limit: 8,
    },
    tags: ["recently viewed", "products", "history", "browsing"],
    keywords: ["recently viewed", "products", "history", "browsing", "last seen"],
  },
  {
    id: "recently-added",
    name: "Recently Added",
    description: "Recently added to store",
    icon: "PlusCircle",
    categories: ["Products", "Utility"],
    isNew: true,
    component: RecentlyAddedSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showDate: true,
    },
    tags: ["recently added", "products", "new", "latest"],
    keywords: ["recently added", "products", "new", "latest", "just added"],
  },
  {
    id: "popular-searches",
    name: "Popular Searches",
    description: "Trending search terms",
    icon: "Search",
    categories: ["Utility", "Content"],
    isNew: true,
    component: PopularSearchesSection,
    defaultConfig: {
      layout: "cloud",
      limit: 10,
    },
    tags: ["searches", "popular", "trending", "keywords"],
    keywords: ["searches", "popular", "trending", "keywords", "terms"],
  },
  {
    id: "instagram-feed",
    name: "Instagram Feed",
    description: "Instagram posts integration",
    icon: "Instagram",
    categories: ["Social", "Media"],
    isNew: true,
    component: InstagramFeedSection,
    defaultConfig: {
      layout: "grid",
      columns: 6,
      limit: 12,
      showCaption: true,
    },
    tags: ["instagram", "social", "feed", "media"],
    keywords: ["instagram", "social", "feed", "media", "photos"],
  },
  {
    id: "blog-posts",
    name: "Blog Posts",
    description: "Latest blog articles",
    icon: "FileText",
    categories: ["Content", "Media"],
    isNew: true,
    component: BlogPostsSection,
    defaultConfig: {
      layout: "grid",
      columns: 3,
      showDate: true,
      showAuthor: true,
      showExcerpt: true,
    },
    tags: ["blog", "posts", "articles", "content"],
    keywords: ["blog", "posts", "articles", "content", "news"],
  },
  {
    id: "trust-badges",
    name: "Trust Badges",
    description: "Trust indicators and badges",
    icon: "Shield",
    categories: ["Trust", "Content"],
    isNew: true,
    component: TrustBadgesSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      badges: [],
    },
    tags: ["trust", "badges", "security", "guarantees"],
    keywords: ["trust", "badges", "security", "guarantees", "certifications"],
  },
  {
    id: "shipping-benefits",
    name: "Shipping Benefits",
    description: "Shipping information and benefits",
    icon: "Truck",
    categories: ["Trust", "Content"],
    isNew: true,
    component: ShippingBenefitsSection,
    defaultConfig: {
      layout: "grid",
      columns: 4,
      benefits: [],
    },
    tags: ["shipping", "delivery", "benefits", "logistics"],
    keywords: ["shipping", "delivery", "benefits", "logistics", "fulfillment"],
  },
  {
    id: "countdown-offer",
    name: "Countdown Offer",
    description: "Limited-time countdown timer offer",
    icon: "Timer",
    categories: ["Marketing", "Conversion"],
    isNew: true,
    component: CountdownOfferSection,
    defaultConfig: {
      endDate: "",
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
    },
    tags: ["countdown", "offer", "timer", "limited time"],
    keywords: ["countdown", "offer", "timer", "limited time", "deadline"],
  },
  {
    id: "footer-banner",
    name: "Footer Banner",
    description: "Bottom promotional banner",
    icon: "Layout",
    categories: ["Marketing", "Conversion"],
    isNew: true,
    component: FooterBannerSection,
    defaultConfig: {
      image: "",
      overlayColor: "rgba(0,0,0,0.3)",
      overlayOpacity: 0.3,
    },
    tags: ["footer", "banner", "promo", "bottom"],
    keywords: ["footer", "banner", "promo", "bottom", "below"],
  },
];

export function getSectionById(id: string): SectionDefinition | undefined {
  return SECTION_DEFINITIONS.find((section) => section.id === id);
}

export function getSectionsByCategory(category: SectionCategory): SectionDefinition[] {
  return SECTION_DEFINITIONS.filter((section) => section.categories.includes(category));
}

export function searchSections(query: string): SectionDefinition[] {
  const lowerQuery = query.toLowerCase();
  return SECTION_DEFINITIONS.filter(
    (section) =>
      section.name.toLowerCase().includes(lowerQuery) ||
      section.description.toLowerCase().includes(lowerQuery) ||
      section.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      section.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}

export function filterSections(filters: {
  category?: SectionCategory;
  popular?: boolean;
  isNew?: boolean;
}): SectionDefinition[] {
  let sections = [...SECTION_DEFINITIONS];

  if (filters.category) {
    sections = sections.filter((section) => section.categories.includes(filters.category!));
  }

  if (filters.popular) {
    sections = sections.filter((section) => section.popular);
  }

  if (filters.isNew) {
    sections = sections.filter((section) => section.isNew);
  }

  return sections;
}

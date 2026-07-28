export type MarketplaceCategory = {
  name: string;
  slug: string;
  count: string;
  icon: string;
  image: string;
  accent: string;
};

export type MarketplaceProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  seller: string;
  price: number;
  comparePrice: number;
  rating: number;
  reviews: number;
  stock: number;
  sold: number;
  discount: number;
  image: string;
  badge?: string;
  tags: string[];
};

export const marketplaceCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    count: "84k",
    icon: "monitor-smartphone",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
    accent: "Smartphones, audio, wearables",
  },
  {
    name: "Fashion",
    slug: "fashion",
    count: "126k",
    icon: "shirt",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
    accent: "Modest wear, sneakers, bags",
  },
  {
    name: "Beauty",
    slug: "beauty",
    count: "52k",
    icon: "sparkles",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85",
    accent: "Argan, perfume, skincare",
  },
  {
    name: "Home",
    slug: "home-living",
    count: "68k",
    icon: "home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    accent: "Lighting, decor, kitchen",
  },
  {
    name: "Gaming",
    slug: "gaming",
    count: "21k",
    icon: "gamepad2",
    image: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=85",
    accent: "Consoles, keyboards, chairs",
  },
  {
    name: "Sports",
    slug: "sports",
    count: "33k",
    icon: "dumbbell",
    image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=85",
    accent: "Training, outdoor, recovery",
  },
  {
    name: "Food",
    slug: "food",
    count: "18k",
    icon: "shopping-basket",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=85",
    accent: "Gourmet pantry, tea, dates",
  },
  {
    name: "Moroccan Products",
    slug: "moroccan-products",
    count: "47k",
    icon: "gem",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=900&q=85",
    accent: "Zellige, leather, argan",
  },
  {
    name: "Automotive",
    slug: "automotive",
    count: "24k",
    icon: "car",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85",
    accent: "Car care, parts, accessories",
  },
];

const productBlueprints = [
  ["Atlas Pro ANC Headphones", "Electronics", "Atlas Audio", "Casablanca Tech Hub", 1599, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"],
  ["Marrakech Leather Weekend Bag", "Fashion", "Dar El Cuir", "Medina Atelier", 1890, "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85"],
  ["Argan Glow Ritual Set", "Beauty", "Tafraout Botanics", "Essaouira Beauty Co", 420, "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85"],
  ["Zellige Table Lamp", "Home", "Riad Studio", "Fes Home Market", 760, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"],
  ["Carbon RGB Gaming Bundle", "Gaming", "NexPlay", "Rabat Gaming Supply", 2490, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=85"],
  ["Safi Ceramic Dinner Set", "Moroccan Products", "Safi Maison", "Cooperative Safi", 640, "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85"],
  ["Casablanca Linen Overshirt", "Fashion", "Casa Cotton", "NexStore Fashion", 520, "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=85"],
  ["Smart Fitness Watch S9", "Electronics", "NovaWear", "Tangier Digital", 1190, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"],
  ["Royal Oud Eau de Parfum", "Beauty", "Maison Oud", "Marrakech Fragrance", 980, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"],
  ["Organic Amlou Pantry Box", "Food", "Sous Pantry", "Agadir Gourmet", 310, "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=85"],
  ["Performance Training Kit", "Sports", "AtlasFit", "NexStore Sports", 690, "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=85"],
  ["Minimal Brass Wall Mirror", "Home", "Riad Studio", "Marrakech Decor", 880, "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85"],
  ["Premium Car Care Kit", "Automotive", "Atlas Auto", "Casa Motors Market", 390, "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=85"],
] as const;

export const marketplaceProducts: MarketplaceProduct[] = Array.from({ length: 10080 }, (_, index) => {
  const [name, category, brand, seller, basePrice, image] = productBlueprints[index % productBlueprints.length];
  const variant = Math.floor(index / productBlueprints.length) + 1;
  const discount = [12, 18, 22, 28, 34, 40][index % 6];
  const price = basePrice + variant * 11 + (index % 7) * 19;
  const comparePrice = Math.round(price / (1 - discount / 100));
  const rating = Number((4.35 + (index % 55) / 100).toFixed(1));

  return {
    id: `nx-${String(index + 1).padStart(4, "0")}`,
    name: variant === 1 ? name : `${name} ${variant}`,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${variant}`,
    category,
    brand,
    seller,
    price,
    comparePrice,
    rating,
    reviews: 120 + index * 9,
    stock: 18 + ((index * 17) % 240),
    sold: 260 + index * 23,
    discount,
    image,
    badge: index % 9 === 0 ? "Sponsored" : index % 5 === 0 ? "Choice" : undefined,
    tags: [category.toLowerCase(), brand.toLowerCase(), seller.toLowerCase()],
  };
});

export const flashDeals = marketplaceProducts.slice(0, 8).map((product, index) => ({
  ...product,
  endsIn: ["04:28:16", "08:11:42", "11:05:09", "02:49:33"][index % 4],
  claimed: 44 + index * 6,
}));

export const bundleDeals = [
  {
    title: "Gaming Command Bundle",
    copy: "Keyboard, mouse, headset, and desk mat curated for fast setup.",
    products: ["RGB keyboard", "Wireless mouse", "7.1 headset"],
    price: 1690,
    comparePrice: 2310,
    image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Moroccan Beauty Box",
    copy: "Argan oil, perfume mist, ghassoul mask, and satin pouch.",
    products: ["Argan oil", "Oud mist", "Ghassoul mask"],
    price: 449,
    comparePrice: 690,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Riad Home Refresh",
    copy: "Ceramic tray, brass lamp, woven cushion, and amber candle.",
    products: ["Ceramic tray", "Brass lamp", "Woven cushion"],
    price: 1180,
    comparePrice: 1640,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
  },
];

export const myStoreBoxes = [
  {
    name: "Moroccan Beauty Box",
    cadence: "Monthly",
    price: 299,
    items: "5 full-size products",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Riad Home Box",
    cadence: "Quarterly",
    price: 549,
    items: "Decor, scent, tableware",
    image: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1000&q=85",
  },
];

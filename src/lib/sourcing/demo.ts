import { ExternalProduct, SourcingProvider } from "./types";

const DEMO_CATALOG: ExternalProduct[] = [
  {
    source: "DEMO",
    externalProductId: "DEMO-001",
    externalUrl: "https://demo.nexmart.ma/DEMO-001",
    supplierName: "Demo Electronics Ltd",
    title: "Premium Smartwatch",
    description: "A high-end smartwatch with AMOLED display and 14-day battery life.",
    originalPrice: 19.90,
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80"],
    stock: 245,
    rating: 4.7,
  },
  {
    source: "DEMO",
    externalProductId: "DEMO-002",
    externalUrl: "https://demo.nexmart.ma/DEMO-002",
    supplierName: "Demo Fashion Co",
    title: "Minimalist Stainless Steel Bracelet",
    description: "Elegant, rust-proof minimalist bracelet suitable for all occasions.",
    originalPrice: 8.50,
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80"],
    stock: 120,
    rating: 4.9,
  },
  {
    source: "DEMO",
    externalProductId: "DEMO-003",
    externalUrl: "https://demo.nexmart.ma/DEMO-003",
    supplierName: "Demo Sound",
    title: "Wireless Earbuds Pro",
    description: "Active noise cancelling wireless earbuds with premium sound.",
    originalPrice: 45.00,
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"],
    stock: 85,
    rating: 4.5,
  },
  {
    source: "DEMO",
    externalProductId: "DEMO-004",
    externalUrl: "https://demo.nexmart.ma/DEMO-004",
    supplierName: "Demo Fragrances",
    title: "Luxury Perfume - Oud Wood",
    description: "Premium scent crafted with authentic Oud and oriental spices.",
    originalPrice: 65.00,
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80"],
    stock: 30,
    rating: 4.8,
  },
  {
    source: "DEMO",
    externalProductId: "DEMO-005",
    externalUrl: "https://demo.nexmart.ma/DEMO-005",
    supplierName: "Demo Electronics Ltd",
    title: "Portable Mini Projector",
    description: "1080p supported mini projector for home theater.",
    originalPrice: 55.00,
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1626025219983-a4fbd56621fb?auto=format&fit=crop&w=800&q=80"],
    stock: 15,
    rating: 4.3,
  },
  {
    source: "DEMO",
    externalProductId: "DEMO-006",
    externalUrl: "https://demo.nexmart.ma/DEMO-006",
    supplierName: "Demo Home Decor",
    title: "LED Desk Lamp with Wireless Charging",
    description: "Modern desk lamp with adjustable brightness and built-in wireless phone charger.",
    originalPrice: 24.99,
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80"],
    stock: 50,
    rating: 4.6,
  }
];

export class DemoProvider implements SourcingProvider {
  name = "DEMO";

  async fetchProduct(urlOrId: string): Promise<ExternalProduct | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const id = urlOrId.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();
    const product = DEMO_CATALOG.find((p) => p.externalProductId === id);
    
    if (product) {
      return product;
    }
    
    // Fallback: Just return a generic demo product based on input if not found exactly
    return {
      ...DEMO_CATALOG[0],
      externalProductId: `DEMO-${Math.floor(Math.random() * 9000) + 1000}`,
      title: `Demo Product (${urlOrId})`,
    };
  }

  async searchProducts(query: string): Promise<ExternalProduct[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const lowerQuery = query.toLowerCase();
    
    if (!lowerQuery) return DEMO_CATALOG;
    
    return DEMO_CATALOG.filter(
      (p) => p.title.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery)
    );
  }
}

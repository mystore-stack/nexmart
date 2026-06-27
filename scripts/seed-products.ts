import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ProductData {
  name: string;
  brand: string;
  categoryId: string;
  organizationId: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  weight?: number;
  tags: string[];
  images: string[];
  variants?: Array<{ name: string; value: string; label: string; price?: number; stock: number; sku?: string }>;
}

const categories = [
  { name: "Smartphones", slug: "smartphones" },
  { name: "Laptops", slug: "laptops" },
  { name: "Tablets", slug: "tablets" },
  { name: "Smart Watches", slug: "smart-watches" },
  { name: "Headphones", slug: "headphones" },
  { name: "Gaming", slug: "gaming" },
  { name: "Keyboards", slug: "keyboards" },
  { name: "Mice", slug: "mice" },
  { name: "Monitors", slug: "monitors" },
  { name: "Cameras", slug: "cameras" },
  { name: "Home Appliances", slug: "home-appliances" },
  { name: "Kitchen", slug: "kitchen" },
  { name: "Office", slug: "office" },
  { name: "Fashion", slug: "fashion" },
  { name: "Shoes", slug: "shoes" },
  { name: "Bags", slug: "bags" },
  { name: "Beauty", slug: "beauty" },
  { name: "Health", slug: "health" },
  { name: "Fitness", slug: "fitness" },
  { name: "Baby", slug: "baby" },
  { name: "Toys", slug: "toys" },
  { name: "Furniture", slug: "furniture" },
  { name: "Lighting", slug: "lighting" },
  { name: "Automotive", slug: "automotive" },
  { name: "Pet Supplies", slug: "pet-supplies" },
];

const products: ProductData[] = [
  // SMARTPHONES (4 products)
  {
    name: "iPhone 15 Pro Max 256GB",
    brand: "Apple",
    categoryId: "",
    organizationId: "",
    slug: "iphone-15-pro-max-256gb",
    sku: "APL-IP15PM-256",
    description: "Experience the ultimate in smartphone technology with the iPhone 15 Pro Max. Featuring the powerful A17 Pro chip, a stunning 6.7-inch Super Retina XDR display, and an advanced camera system with 5x optical zoom. Titanium design for exceptional durability and premium feel.",
    price: 14999,
    comparePrice: 16999,
    stock: 45,
    weight: 0.221,
    tags: ["smartphone", "apple", "iphone", "5g", "pro", "max", "titanium", "camera"],
    images: [],
    variants: [
      { name: "Color", value: "natural-titanium", label: "Natural Titanium", stock: 15, sku: "APL-IP15PM-256-NT" },
      { name: "Color", value: "blue-titanium", label: "Blue Titanium", stock: 10, sku: "APL-IP15PM-256-BT" },
      { name: "Color", value: "white-titanium", label: "White Titanium", stock: 12, sku: "APL-IP15PM-256-WT" },
      { name: "Color", value: "black-titanium", label: "Black Titanium", stock: 8, sku: "APL-IP15PM-256-BKT" },
    ],
  },
  {
    name: "Samsung Galaxy S24 Ultra 512GB",
    brand: "Samsung",
    categoryId: "",
    organizationId: "",
    slug: "samsung-galaxy-s24-ultra-512gb",
    sku: "SAM-S24U-512",
    description: "The Samsung Galaxy S24 Ultra redefines mobile excellence with Galaxy AI, a massive 6.8-inch Dynamic AMOLED 2X display, and the most advanced Galaxy camera yet. Powered by Snapdragon 8 Gen 3 for Galaxy for unmatched performance.",
    price: 13999,
    comparePrice: 15999,
    stock: 38,
    weight: 0.232,
    tags: ["smartphone", "samsung", "galaxy", "s24", "ultra", "ai", "camera", "android"],
    images: [],
    variants: [
      { name: "Color", value: "titanium-gray", label: "Titanium Gray", stock: 12, sku: "SAM-S24U-512-TG" },
      { name: "Color", value: "titanium-black", label: "Titanium Black", stock: 10, sku: "SAM-S24U-512-TB" },
      { name: "Color", value: "titanium-violet", label: "Titanium Violet", stock: 10, sku: "SAM-S24U-512-TV" },
      { name: "Color", value: "titanium-yellow", label: "Titanium Yellow", stock: 6, sku: "SAM-S24U-512-TY" },
    ],
  },
  {
    name: "Google Pixel 8 Pro 256GB",
    brand: "Google",
    categoryId: "",
    organizationId: "",
    slug: "google-pixel-8-pro-256gb",
    sku: "GOO-P8P-256",
    description: "The Google Pixel 8 Pro brings the best of Google AI to your fingertips. Featuring the Tensor G3 chip, a brilliant 6.7-inch LTPO OLED display, and the most advanced Pixel Camera with Real Tone for accurate skin tones. 7 years of OS and security updates.",
    price: 10999,
    comparePrice: 11999,
    stock: 52,
    weight: 0.213,
    tags: ["smartphone", "google", "pixel", "ai", "camera", "android", "pro"],
    images: [],
    variants: [
      { name: "Color", value: "obsidian", label: "Obsidian", stock: 18, sku: "GOO-P8P-256-OBS" },
      { name: "Color", value: "porcelain", label: "Porcelain", stock: 17, sku: "GOO-P8P-256-POR" },
      { name: "Color", value: "bay", label: "Bay", stock: 17, sku: "GOO-P8P-256-BAY" },
    ],
  },
  {
    name: "Xiaomi 14 Ultra 512GB",
    brand: "Xiaomi",
    categoryId: "",
    organizationId: "",
    slug: "xiaomi-14-ultra-512gb",
    sku: "XIA-14U-512",
    description: "The Xiaomi 14 Ultra represents the pinnacle of smartphone photography with Leica optics. Features a 6.73-inch AMOLED display, Snapdragon 8 Gen 3 processor, and a revolutionary quad-camera system with 1-inch sensor. 90W fast charging and 80W wireless charging.",
    price: 9999,
    comparePrice: 11499,
    stock: 42,
    weight: 0.224,
    tags: ["smartphone", "xiaomi", "leica", "camera", "android", "ultra", "fast-charging"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 15, sku: "XIA-14U-512-BLK" },
      { name: "Color", value: "white", label: "White", stock: 14, sku: "XIA-14U-512-WHT" },
      { name: "Color", value: "blue", label: "Blue", stock: 13, sku: "XIA-14U-256-BLU" },
    ],
  },

  // LAPTOPS (4 products)
  {
    name: "MacBook Pro 16\" M3 Max 36GB RAM 1TB SSD",
    brand: "Apple",
    categoryId: "",
    organizationId: "",
    slug: "macbook-pro-16-m3-max-36gb-1tb",
    sku: "APL-MBP16-M3M-36-1TB",
    description: "The most powerful MacBook Pro ever. Featuring the revolutionary M3 Max chip with up to 16-core CPU, 40-core GPU, and 36GB unified memory. Stunning 16.2-inch Liquid Retina XDR display with ProMotion technology. Up to 22 hours battery life.",
    price: 34999,
    comparePrice: 38999,
    stock: 18,
    weight: 2.14,
    tags: ["laptop", "apple", "macbook", "pro", "m3", "max", "16-inch", "professional"],
    images: [],
    variants: [
      { name: "Color", value: "space-black", label: "Space Black", stock: 9, sku: "APL-MBP16-M3M-36-1TB-SB" },
      { name: "Color", value: "silver", label: "Silver", stock: 9, sku: "APL-MBP16-M3M-36-1TB-SLV" },
    ],
  },
  {
    name: "Dell XPS 15 9530 i9 32GB RAM 1TB SSD",
    brand: "Dell",
    categoryId: "",
    organizationId: "",
    slug: "dell-xps-15-9530-i9-32gb-1tb",
    sku: "DEL-XPS15-9530-I9-32-1TB",
    description: "Premium performance in a stunning design. The Dell XPS 15 features Intel Core i9 processor, 32GB DDR5 RAM, 1TB NVMe SSD, and NVIDIA GeForce RTX 4070 graphics. 15.6-inch OLED display with 3.5K resolution and touch support.",
    price: 28999,
    comparePrice: 31999,
    stock: 22,
    weight: 1.86,
    tags: ["laptop", "dell", "xps", "i9", "oled", "gaming", "professional", "touch"],
    images: [],
    variants: [
      { name: "Color", value: "platinum-silver", label: "Platinum Silver", stock: 12, sku: "DEL-XPS15-9530-I9-32-1TB-PS" },
      { name: "Color", value: "graphite", label: "Graphite", stock: 10, sku: "DEL-XPS15-9530-I9-32-1TB-GR" },
    ],
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 12 i7 32GB 512GB",
    brand: "Lenovo",
    categoryId: "",
    organizationId: "",
    slug: "lenovo-thinkpad-x1-carbon-gen-12-i7-32gb-512gb",
    sku: "LEN-TPX1C12-I7-32-512",
    description: "The ultimate business ultrabook. ThinkPad X1 Carbon Gen 12 features Intel Core i7 vPro, 32GB LPDDR5X memory, 512GB SSD, and a beautiful 14-inch OLED display. Military-grade durability, carbon fiber construction, and legendary ThinkPad keyboard.",
    price: 24999,
    comparePrice: 27999,
    stock: 25,
    weight: 1.12,
    tags: ["laptop", "lenovo", "thinkpad", "business", "ultrabook", "oled", "durable"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 15, sku: "LEN-TPX1C12-I7-32-512-BLK" },
      { name: "Color", value: "storm-gray", label: "Storm Gray", stock: 10, sku: "LEN-TPX1C12-I7-32-512-SG" },
    ],
  },
  {
    name: "ASUS ROG Zephyrus G16 Ryzen 9 32GB 1TB RTX 4080",
    brand: "ASUS",
    categoryId: "",
    organizationId: "",
    slug: "asus-rog-zephyrus-g16-ryzen-9-32gb-1tb-rtx-4080",
    sku: "ASU-ROGZG16-R9-32-1TB-4080",
    description: "Dominate any game with the ASUS ROG Zephyrus G16. Powered by AMD Ryzen 9 7945HX, 32GB DDR5 RAM, 1TB SSD, and NVIDIA GeForce RTX 4080. 16-inch Nebula HDR display with 240Hz refresh rate and ROG intelligent cooling system.",
    price: 26999,
    comparePrice: 29999,
    stock: 20,
    weight: 2.1,
    tags: ["laptop", "asus", "rog", "gaming", "ryzen", "rtx", "4080", "high-refresh"],
    images: [],
    variants: [
      { name: "Color", value: "eclipse-gray", label: "Eclipse Gray", stock: 12, sku: "ASU-ROGZG16-R9-32-1TB-4080-EG" },
      { name: "Color", value: "moonlight-white", label: "Moonlight White", stock: 8, sku: "ASU-ROGZG16-R9-32-1TB-4080-MW" },
    ],
  },

  // TABLETS (3 products)
  {
    name: "iPad Pro 12.9\" M4 256GB Wi-Fi",
    brand: "Apple",
    categoryId: "",
    organizationId: "",
    slug: "ipad-pro-12-9-m4-256gb-wifi",
    sku: "APL-IPP129-M4-256-WIFI",
    description: "The most advanced iPad ever. iPad Pro 12.9-inch with M4 chip delivers unprecedented performance. Stunning Ultra Retina XDR display with ProMotion, 120Hz refresh rate, and 1600 nits peak brightness. Compatible with Apple Pencil Pro and Magic Keyboard.",
    price: 11999,
    comparePrice: 13499,
    stock: 35,
    weight: 0.682,
    tags: ["tablet", "apple", "ipad", "pro", "m4", "12-9-inch", "oled", "pencil"],
    images: [],
    variants: [
      { name: "Color", value: "space-black", label: "Space Black", stock: 18, sku: "APL-IPP129-M4-256-WIFI-SB" },
      { name: "Color", value: "silver", label: "Silver", stock: 17, sku: "APL-IPP129-M4-256-WIFI-SLV" },
    ],
  },
  {
    name: "Samsung Galaxy Tab S9 Ultra 256GB",
    brand: "Samsung",
    categoryId: "",
    organizationId: "",
    slug: "samsung-galaxy-tab-s9-ultra-256gb",
    sku: "SAM-TS9U-256",
    description: "The ultimate tablet experience. Galaxy Tab S9 Ultra features a massive 14.6-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 2 for Galaxy, and S Pen included. Vision Booster technology for outdoor visibility and AKG-tuned quad speakers.",
    price: 9999,
    comparePrice: 11499,
    stock: 28,
    weight: 0.732,
    tags: ["tablet", "samsung", "galaxy", "tab", "s9", "ultra", "14-6-inch", "s-pen"],
    images: [],
    variants: [
      { name: "Color", value: "phantom-black", label: "Phantom Black", stock: 10, sku: "SAM-TS9U-256-PB" },
      { name: "Color", value: "phantom-gray", label: "Phantom Gray", stock: 10, sku: "SAM-TS9U-256-PG" },
      { name: "Color", value: "beige", label: "Beige", stock: 8, sku: "SAM-TS9U-256-BG" },
    ],
  },
  {
    name: "Microsoft Surface Pro 11 Snapdragon X Elite 16GB 512GB",
    brand: "Microsoft",
    categoryId: "",
    organizationId: "",
    slug: "microsoft-surface-pro-11-snapdragon-x-elite-16gb-512gb",
    sku: "MSF-SP11-SXE-16-512",
    description: "The most flexible 2-in-1 device. Surface Pro 11 with Snapdragon X Elite delivers exceptional performance and all-day battery life. 13-inch PixelSense Flow display with 120Hz refresh rate. Includes Surface Pro Keyboard and Surface Slim Pen 2.",
    price: 12999,
    comparePrice: 14999,
    stock: 24,
    weight: 0.879,
    tags: ["tablet", "microsoft", "surface", "pro", "2-in-1", "snapdragon", "keyboard", "pen"],
    images: [],
    variants: [
      { name: "Color", value: "platinum", label: "Platinum", stock: 12, sku: "MSF-SP11-SXE-16-512-PL" },
      { name: "Color", value: "sapphire", label: "Sapphire", stock: 12, sku: "MSF-SP11-SXE-16-512-SAP" },
    ],
  },

  // SMART WATCHES (3 products)
  {
    name: "Apple Watch Ultra 2 49mm GPS + Cellular",
    brand: "Apple",
    categoryId: "",
    organizationId: "",
    slug: "apple-watch-ultra-2-49mm-gps-cellular",
    sku: "APL-AWU2-49-GPS-CEL",
    description: "The most rugged and capable Apple Watch. Apple Watch Ultra 2 features the S9 SiP chip, Always-On Retina display up to 3000 nits, and precision dual-frequency GPS. 36-hour battery life with Action button and customizable watch faces.",
    price: 7999,
    comparePrice: 8999,
    stock: 42,
    weight: 0.0615,
    tags: ["smartwatch", "apple", "watch", "ultra", "gps", "cellular", "rugged", "fitness"],
    images: [],
    variants: [
      { name: "Color", value: "orange-alpine", label: "Orange Alpine", stock: 15, sku: "APL-AWU2-49-GPS-CEL-OA" },
      { name: "Color", value: "green-alpine", label: "Green Alpine", stock: 14, sku: "APL-AWU2-49-GPS-CEL-GA" },
      { name: "Color", value: "black-alpine", label: "Black Alpine", stock: 13, sku: "APL-AWU2-49-GPS-CEL-BA" },
    ],
  },
  {
    name: "Samsung Galaxy Watch 6 Classic 47mm LTE",
    brand: "Samsung",
    categoryId: "",
    organizationId: "",
    slug: "samsung-galaxy-watch-6-classic-47mm-lte",
    sku: "SAM-GW6C-47-LTE",
    description: "Classic design meets modern technology. Galaxy Watch 6 Classic features a rotating bezel, 1.5-inch Super AMOLED display, and BioActive Sensor for advanced health monitoring. LTE connectivity for calls and messages without your phone.",
    price: 4499,
    comparePrice: 5199,
    stock: 38,
    weight: 0.059,
    tags: ["smartwatch", "samsung", "galaxy", "watch", "classic", "lte", "health", "bezel"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 13, sku: "SAM-GW6C-47-LTE-BLK" },
      { name: "Color", value: "silver", label: "Silver", stock: 13, sku: "SAM-GW6C-47-LTE-SLV" },
      { name: "Color", value: "green", label: "Green", stock: 12, sku: "SAM-GW6C-47-LTE-GRN" },
    ],
  },
  {
    name: "Garmin Fenix 7 Pro Solar 47mm",
    brand: "Garmin",
    categoryId: "",
    organizationId: "",
    slug: "garmin-fenix-7-pro-solar-47mm",
    sku: "GAR-F7P-SOL-47",
    description: "The ultimate multisport GPS watch. Fenix 7 Pro Solar features Power Glass solar charging lens, built-in flashlight, and multi-band GNSS for precise tracking. Advanced health metrics, preloaded maps, and up to 37 days battery life in smartwatch mode.",
    price: 8999,
    comparePrice: 9999,
    stock: 22,
    weight: 0.079,
    tags: ["smartwatch", "garmin", "fenix", "pro", "solar", "gps", "multisport", "outdoor"],
    images: [],
    variants: [
      { name: "Color", value: "black-carbon", label: "Black Carbon", stock: 8, sku: "GAR-F7P-SOL-47-BC" },
      { name: "Color", value: "gray-carbon", label: "Gray Carbon", stock: 7, sku: "GAR-F7P-SOL-47-GC" },
      { name: "Color", value: "sapphire-solar", label: "Sapphire Solar", stock: 7, sku: "GAR-F7P-SOL-47-SS" },
    ],
  },

  // HEADPHONES (3 products)
  {
    name: "Sony WH-1000XM5 Wireless Noise Cancelling",
    brand: "Sony",
    categoryId: "",
    organizationId: "",
    slug: "sony-wh-1000xm5-wireless-noise-cancelling",
    sku: "SNY-WH1000XM5",
    description: "Industry-leading noise cancellation with Auto NC Optimizer. Sony WH-1000XM5 features 30-hour battery life, Multipoint connection, and crystal clear hands-free calling. Lightweight design with soft-fit leather for all-day comfort.",
    price: 3499,
    comparePrice: 3999,
    stock: 55,
    weight: 0.25,
    tags: ["headphones", "sony", "wireless", "noise-cancelling", "bluetooth", "premium"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 20, sku: "SNY-WH1000XM5-BLK" },
      { name: "Color", value: "silver", label: "Silver", stock: 18, sku: "SNY-WH1000XM5-SLV" },
      { name: "Color", value: "midnight-blue", label: "Midnight Blue", stock: 17, sku: "SNY-WH1000XM5-MB" },
    ],
  },
  {
    name: "Bose QuietComfort Ultra Noise Cancelling",
    brand: "Bose",
    categoryId: "",
    organizationId: "",
    slug: "bose-quietcomfort-ultra-noise-cancelling",
    sku: "BOS-QC-ULTRA",
    description: "The best noise cancelling headphones from Bose. QuietComfort Ultra features CustomTune technology that personalizes audio to your ears, Immersive Audio for spatial sound, and up to 24 hours battery life. Bluetooth 5.3 with Multipoint connection.",
    price: 3999,
    comparePrice: 4499,
    stock: 48,
    weight: 0.24,
    tags: ["headphones", "bose", "quietcomfort", "noise-cancelling", "spatial-audio", "bluetooth"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 16, sku: "BOS-QC-ULTRA-BLK" },
      { name: "Color", value: "white-silver", label: "White Silver", stock: 16, sku: "BOS-QC-ULTRA-WS" },
      { name: "Color", value: "cloud-white", label: "Cloud White", stock: 16, sku: "BOS-QC-ULTRA-CW" },
    ],
  },
  {
    name: "Apple AirPods Max Wireless Over-Ear",
    brand: "Apple",
    categoryId: "",
    organizationId: "",
    slug: "apple-airpods-max-wireless-over-ear",
    sku: "APL-APM",
    description: "High-fidelity audio with Active Noise Cancellation. AirPods Max features Apple-designed dynamic driver, computational audio, and Transparency mode. Memory foam ear cushions, stainless steel frame, and 20 hours battery life.",
    price: 5499,
    comparePrice: 5999,
    stock: 35,
    weight: 0.384,
    tags: ["headphones", "apple", "airpods", "max", "noise-cancelling", "hifi", "spatial"],
    images: [],
    variants: [
      { name: "Color", value: "space-gray", label: "Space Gray", stock: 9, sku: "APL-APM-SG" },
      { name: "Color", value: "silver", label: "Silver", stock: 9, sku: "APL-APM-SLV" },
      { name: "sky-blue", label: "Sky Blue", stock: 9, sku: "APL-APM-SB", value: "sky-blue" },
      { name: "pink", label: "Pink", stock: 8, sku: "APL-APM-PK", value: "pink" },
    ],
  },

  // GAMING (3 products)
  {
    name: "PlayStation 5 Slim 1TB Digital Edition",
    brand: "Sony",
    categoryId: "",
    organizationId: "",
    slug: "playstation-5-slim-1tb-digital-edition",
    sku: "SNY-PS5S-1TB-DE",
    description: "The next generation of gaming. PlayStation 5 Slim features ultra-high speed SSD, 4K gaming at up to 120fps, ray tracing, and 3D audio. 1TB storage, DualSense wireless controller with haptic feedback, and extensive game library.",
    price: 6499,
    comparePrice: 6999,
    stock: 30,
    weight: 3.2,
    tags: ["gaming", "playstation", "ps5", "sony", "console", "4k", "dualsense"],
    images: [],
    variants: [
      { name: "Edition", value: "digital", label: "Digital Edition", stock: 15, sku: "SNY-PS5S-1TB-DE" },
      { name: "Edition", value: "disc", label: "Disc Edition", stock: 15, sku: "SNY-PS5S-1TB-DISC" },
    ],
  },
  {
    name: "Xbox Series X 1TB",
    brand: "Microsoft",
    categoryId: "",
    organizationId: "",
    slug: "xbox-series-x-1tb",
    sku: "MSF-XSX-1TB",
    description: "The most powerful Xbox ever. Xbox Series X features 12 teraflops of processing power, 4K gaming at 60fps, Quick Resume for multiple games, and Xbox Game Pass. 1TB custom SSD, wireless controller, and backward compatibility.",
    price: 5999,
    comparePrice: 6499,
    stock: 28,
    weight: 4.45,
    tags: ["gaming", "xbox", "microsoft", "console", "series-x", "4k", "game-pass"],
    images: [],
    variants: [
      { name: "Color", value: "robot-white", label: "Robot White", stock: 28, sku: "MSF-XSX-1TB-RW" },
    ],
  },
  {
    name: "Nintendo Switch OLED Model 64GB",
    brand: "Nintendo",
    categoryId: "",
    organizationId: "",
    slug: "nintendo-switch-oled-model-64gb",
    sku: "NIN-SW-OLED-64",
    description: "The ultimate Nintendo Switch experience. OLED Model features vibrant 7-inch OLED screen, enhanced audio, 64GB internal storage, and wide adjustable stand. Dock with wired LAN port and improved kickstand for tabletop mode.",
    price: 3499,
    comparePrice: 3999,
    stock: 45,
    weight: 0.42,
    tags: ["gaming", "nintendo", "switch", "oled", "portable", "console", "hybrid"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 23, sku: "NIN-SW-OLED-64-WHT" },
      { name: "Color", value: "neon-red-blue", label: "Neon Red/Blue", stock: 22, sku: "NIN-SW-OLED-64-NRB" },
    ],
  },

  // KEYBOARDS (3 products)
  {
    name: "Keychron Q1 Pro QMK/VIA Wireless Custom Keyboard",
    brand: "Keychron",
    categoryId: "",
    organizationId: "",
    slug: "keychron-q1-pro-qmk-via-wireless-custom-keyboard",
    sku: "KEY-Q1PRO-QMK",
    description: "Premium wireless mechanical keyboard. Keychron Q1 Pro features QMK/VIA programmability, Bluetooth 5.1, 2.4G wireless, and USB-C wired connection. Aluminum frame, Gasket Mount, and hot-swappable PCB for endless customization.",
    price: 1999,
    comparePrice: 2299,
    stock: 32,
    weight: 1.2,
    tags: ["keyboard", "keychron", "mechanical", "wireless", "qmk", "custom", "aluminum"],
    images: [],
    variants: [
      { name: "Layout", value: "75", label: "75%", stock: 16, sku: "KEY-Q1PRO-QMK-75" },
      { name: "Layout", value: "ansi", label: "ANSI", stock: 16, sku: "KEY-Q1PRO-QMK-ANSI" },
    ],
  },
  {
    name: "Logitech MX Mechanical Wireless Keyboard",
    brand: "Logitech",
    categoryId: "",
    organizationId: "",
    slug: "logitech-mx-mechanical-wireless-keyboard",
    sku: "LOG-MX-MECH",
    description: "Advanced performance keyboard for professionals. MX Mechanical features low-profile mechanical switches, Smart Keys for workflow, and multi-device connectivity with Easy Switch. USB-C rechargeable with up to 15 months battery life.",
    price: 2299,
    comparePrice: 2599,
    stock: 38,
    weight: 0.81,
    tags: ["keyboard", "logitech", "mx", "mechanical", "wireless", "professional", "low-profile"],
    images: [],
    variants: [
      { name: "Switch", value: "tactile", label: "Tactile Quiet", stock: 13, sku: "LOG-MX-MECH-TQ" },
      { name: "Switch", value: "clicky", label: "Clicky", stock: 13, sku: "LOG-MX-MECH-CK" },
      { name: "Switch", value: "linear", label: "Linear", stock: 12, sku: "LOG-MX-MECH-LN" },
    ],
  },
  {
    name: "Razer BlackWidow V4 Pro Mechanical Keyboard",
    brand: "Razer",
    categoryId: "",
    organizationId: "",
    slug: "razer-blackwidow-v4-pro-mechanical-keyboard",
    sku: "RAZ-BWV4P",
    description: "The ultimate gaming keyboard. BlackWidow V4 Pro features Razer Green Mechanical Switches, Chroma RGB lighting with 16.8 million colors, and dedicated media keys. Magnetic wrist rest, multi-device wireless, and 200 hours battery life.",
    price: 2499,
    comparePrice: 2799,
    stock: 30,
    weight: 1.32,
    tags: ["keyboard", "razer", "blackwidow", "mechanical", "gaming", "rgb", "wireless"],
    images: [],
    variants: [
      { name: "Switch", value: "green", label: "Green Clicky", stock: 15, sku: "RAZ-BWV4P-G" },
      { name: "Switch", value: "yellow", label: "Yellow Linear", stock: 15, sku: "RAZ-BWV4P-Y" },
    ],
  },

  // MICE (3 products)
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    brand: "Logitech",
    categoryId: "",
    organizationId: "",
    slug: "logitech-mx-master-3s-wireless-mouse",
    sku: "LOG-MXM3S",
    description: "The advanced wireless mouse for power users. MX Master 3S features 8K DPI tracking on glass, MagSpeed electromagnetic scrolling, and Quiet Clicks. Multi-device workflow with Easy Switch and USB-C quick charging.",
    price: 1299,
    comparePrice: 1499,
    stock: 55,
    weight: 0.141,
    tags: ["mouse", "logitech", "mx", "master", "wireless", "ergonomic", "professional"],
    images: [],
    variants: [
      { name: "Color", value: "graphite", label: "Graphite", stock: 28, sku: "LOG-MXM3S-GR" },
      { name: "Color", value: "pale-gray", label: "Pale Gray", stock: 27, sku: "LOG-MXM3S-PG" },
    ],
  },
  {
    name: "Razer DeathAdder V3 Pro Wireless Gaming Mouse",
    brand: "Razer",
    categoryId: "",
    organizationId: "",
    slug: "razer-deathadder-v3-pro-wireless-gaming-mouse",
    sku: "RAZ-DAV3P",
    description: "The most advanced DeathAdder yet. V3 Pro features Focus Pro 30K optical sensor, Razer HyperSpeed wireless, and Razer Optical Mouse Switches. Ergonomic design with 90 million click lifespan and up to 90 hours battery life.",
    price: 1499,
    comparePrice: 1699,
    stock: 42,
    weight: 0.063,
    tags: ["mouse", "razer", "deathadder", "gaming", "wireless", "optical", "ergonomic"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Classic Black", stock: 22, sku: "RAZ-DAV3P-BLK" },
      { name: "Color", value: "white", label: "Mercury White", stock: 20, sku: "RAZ-DAV3P-WHT" },
    ],
  },
  {
    name: "Apple Magic Mouse 2 Wireless",
    brand: "Apple",
    categoryId: "",
    organizationId: "",
    slug: "apple-magic-mouse-2-wireless",
    sku: "APL-MM2",
    description: "Rechargeable wireless mouse with Multi-Touch surface. Magic Mouse 2 features seamless bottom shell, optimized foot design, and Lightning cable for charging. Gesture support for swipe and scroll with Bluetooth connectivity.",
    price: 999,
    comparePrice: 1199,
    stock: 48,
    weight: 0.099,
    tags: ["mouse", "apple", "magic", "wireless", "multi-touch", "rechargeable"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 24, sku: "APL-MM2-WHT" },
      { name: "Color", value: "black", label: "Black", stock: 24, sku: "APL-MM2-BLK" },
    ],
  },

  // MONITORS (3 products)
  {
    name: "LG UltraGear 27GP850 27\" 165Hz IPS Gaming Monitor",
    brand: "LG",
    categoryId: "",
    organizationId: "",
    slug: "lg-ultragear-27gp850-27-165hz-ips-gaming-monitor",
    sku: "LG-UG27GP850",
    description: "Premium gaming monitor with Nano IPS display. 27-inch QHD resolution, 165Hz refresh rate overclockable to 180Hz, 1ms response time, and 98% DCI-P3 color gamut. NVIDIA G-SYNC Compatible and AMD FreeSync Premium Pro.",
    price: 4499,
    comparePrice: 4999,
    stock: 25,
    weight: 5.1,
    tags: ["monitor", "lg", "ultragear", "gaming", "ips", "165hz", "qhd", "g-sync"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 25, sku: "LG-UG27GP850-BLK" },
    ],
  },
  {
    name: "Dell UltraSharp U2723QE 27\" 4K USB-C Hub Monitor",
    brand: "Dell",
    categoryId: "",
    organizationId: "",
    slug: "dell-ultrasharp-u2723qe-27-4k-usb-c-hub-monitor",
    sku: "DEL-US2723QE",
    description: "Professional 4K monitor with IPS Black technology. 27-inch UHD resolution, 98% DCI-P3 color coverage, and ComfortView Plus. USB-C with 90W power delivery, RJ45 Ethernet, and extensive connectivity for productivity.",
    price: 5499,
    comparePrice: 5999,
    stock: 22,
    weight: 5.6,
    tags: ["monitor", "dell", "ultrasharp", "4k", "ips-black", "usb-c", "professional"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 22, sku: "DEL-US2723QE-BLK" },
    ],
  },
  {
    name: "Samsung Odyssey OLED G9 49\" 240Hz Curved Gaming Monitor",
    brand: "Samsung",
    categoryId: "",
    organizationId: "",
    slug: "samsung-odyssey-oled-g9-49-240hz-curved-gaming-monitor",
    sku: "SAM-OG9-OLED",
    description: "The ultimate gaming monitor. 49-inch super ultrawide OLED display with 5120x1440 resolution, 240Hz refresh rate, and 0.03ms response time. 1800R curvature, AMD FreeSync Premium Pro, and built-in speakers.",
    price: 12999,
    comparePrice: 14999,
    stock: 15,
    weight: 10.5,
    tags: ["monitor", "samsung", "odyssey", "oled", "49-inch", "240hz", "curved", "ultrawide"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 15, sku: "SAM-OG9-OLED-BLK" },
    ],
  },

  // CAMERAS (3 products)
  {
    name: "Sony Alpha 7 IV Mirrorless Camera Body",
    brand: "Sony",
    categoryId: "",
    organizationId: "",
    slug: "sony-alpha-7-iv-mirrorless-camera-body",
    sku: "SNY-A7IV-BODY",
    description: "The hybrid camera for creators. Alpha 7 IV features 33MP full-frame sensor, BIONZ XR processor, 4K 60p video, and real-time Eye AF. 759 phase-detection points, 10fps continuous shooting, and S-Log3/S-Gamut3.Cin for cinematic color.",
    price: 24999,
    comparePrice: 27999,
    stock: 18,
    weight: 0.658,
    tags: ["camera", "sony", "alpha", "mirrorless", "full-frame", "4k", "video", "hybrid"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 18, sku: "SNY-A7IV-BODY-BLK" },
    ],
  },
  {
    name: "Canon EOS R6 Mark II Mirrorless Camera Body",
    brand: "Canon",
    categoryId: "",
    organizationId: "",
    slug: "canon-eos-r6-mark-ii-mirrorless-camera-body",
    sku: "CAN-EOR6M2-BODY",
    description: "Professional hybrid mirrorless camera. EOS R6 Mark II features 24.2MP full-frame sensor, DIGIC X processor, 40fps electronic shutter, and 6K RAW video. Dual card slots, 1053 AF points, and advanced image stabilization.",
    price: 26999,
    comparePrice: 29999,
    stock: 16,
    weight: 0.67,
    tags: ["camera", "canon", "eos", "r6", "mirrorless", "full-frame", "6k", "video"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 16, sku: "CAN-EOR6M2-BODY-BLK" },
    ],
  },
  {
    name: "Fujifilm X-T5 Mirrorless Camera Body",
    brand: "Fujifilm",
    categoryId: "",
    organizationId: "",
    slug: "fujifilm-x-t5-mirrorless-camera-body",
    sku: "FUJ-XT5-BODY",
    description: "The ultimate X Series camera. X-T5 features 40.2MP X-Trans CMOS 5 HR sensor, X-Processor 5, and in-body image stabilization. Classic film simulations, 8K 30p video, and weather-sealed magnesium alloy body.",
    price: 19999,
    comparePrice: 21999,
    stock: 20,
    weight: 0.557,
    tags: ["camera", "fujifilm", "x-t5", "mirrorless", "aps-c", "film-simulation", "8k"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 10, sku: "FUJ-XT5-BODY-BLK" },
      { name: "Color", value: "silver", label: "Silver", stock: 10, sku: "FUJ-XT5-BODY-SLV" },
    ],
  },

  // HOME APPLIANCES (3 products)
  {
    name: "Dyson V15 Detect Absolute Cordless Vacuum",
    brand: "Dyson",
    categoryId: "",
    organizationId: "",
    slug: "dyson-v15-detect-absolute-cordless-vacuum",
    sku: "DYS-V15-ABS",
    description: "The most powerful cordless vacuum. V15 Detect features laser illumination to reveal microscopic dust, Piezo sensor for real-time particle count, and auto-adapt suction. Up to 60 minutes runtime and HEPA filtration.",
    price: 7999,
    comparePrice: 8999,
    stock: 28,
    weight: 3.0,
    tags: ["vacuum", "dyson", "cordless", "v15", "laser", "hepa", "smart"],
    images: [],
    variants: [
      { name: "Color", value: "yellow-nickel", label: "Yellow/Nickel", stock: 14, sku: "DYS-V15-ABS-YN" },
      { name: "Color", value: "blue-gold", label: "Blue/Gold", stock: 14, sku: "DYS-V15-ABS-BG" },
    ],
  },
  {
    name: "Philips Airfryer XXL Premium Digital",
    brand: "Philips",
    categoryId: "",
    organizationId: "",
    slug: "philips-airfryer-xxl-premium-digital",
    sku: "PHL-AFXXL-PREM",
    description: "The healthiest way to fry. Airfryer XXL features Rapid Air technology for crispy results with up to 90% less fat. 7.3L capacity, digital display with 7 presets, and fat removal technology. Dishwasher-safe parts.",
    price: 3499,
    comparePrice: 3999,
    stock: 35,
    weight: 8.1,
    tags: ["airfryer", "philips", "xxl", "digital", "healthy", "cooking", "large-capacity"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 18, sku: "PHL-AFXXL-PREM-BLK" },
      { name: "Color", value: "white", label: "White", stock: 17, sku: "PHL-AFXXL-PREM-WHT" },
    ],
  },
  {
    name: "Roborock S8 Pro Ultra Robot Vacuum & Mop",
    brand: "Roborock",
    categoryId: "",
    organizationId: "",
    slug: "roborock-s8-pro-ultra-robot-vacuum-mop",
    sku: "ROB-S8PU",
    description: "The ultimate floor cleaning robot. S8 Pro Ultra features VibraRise mopping system, 6000Pa suction, and auto-empty dock with hot water washing. AI obstacle avoidance, multi-floor mapping, and 180-minute runtime.",
    price: 8999,
    comparePrice: 9999,
    stock: 22,
    weight: 4.2,
    tags: ["robot-vacuum", "roborock", "s8", "mop", "auto-empty", "ai", "smart-home"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 12, sku: "ROB-S8PU-WHT" },
      { name: "Color", value: "black", label: "Black", stock: 10, sku: "ROB-S8PU-BLK" },
    ],
  },

  // KITCHEN (3 products)
  {
    name: "Nespresso Vertuo Next Coffee Machine",
    brand: "Nespresso",
    categoryId: "",
    organizationId: "",
    slug: "nespresso-vertuo-next-coffee-machine",
    sku: "NES-VNEXT",
    description: "The versatile coffee machine. Vertuo Next uses Centrifusion technology to extract the perfect cup. Compatible with 5 cup sizes, Bluetooth connectivity, and 100% recyclable aluminum capsules. 30-second heat-up time.",
    price: 2499,
    comparePrice: 2799,
    stock: 42,
    weight: 4.6,
    tags: ["coffee", "nespresso", "vertuo", "capsule", "bluetooth", "espresso", "coffee-machine"],
    images: [],
    variants: [
      { name: "Color", value: "matte-black", label: "Matte Black", stock: 14, sku: "NES-VNEXT-MB" },
      { name: "Color", value: "chrome", label: "Chrome", stock: 14, sku: "NES-VNEXT-CHR" },
      { name: "Color", value: "white", label: "White", stock: 14, sku: "NES-VNEXT-WHT" },
    ],
  },
  {
    name: "KitchenAid Stand Mixer 4.7L Artisan",
    brand: "KitchenAid",
    categoryId: "",
    organizationId: "",
    slug: "kitchenaid-stand-mixer-4-7l-artisan",
    sku: "KTA-ARTISAN-47",
    description: "The iconic kitchen mixer. Artisan features 4.7L stainless steel bowl, 10-speed direct drive motor, and planetary mixing action. Includes flat beater, dough hook, and wire whip. Over 10 optional attachments available.",
    price: 4999,
    comparePrice: 5499,
    stock: 25,
    weight: 10.7,
    tags: ["mixer", "kitchenaid", "artisan", "stand-mixer", "baking", "professional", "attachments"],
    images: [],
    variants: [
      { name: "Color", value: "empire-red", label: "Empire Red", stock: 6, sku: "KTA-ARTISAN-47-ER" },
      { name: "Color", value: "onyx-black", label: "Onyx Black", stock: 6, sku: "KTA-ARTISAN-47-OB" },
      { name: "Color", value: "contour-silver", label: "Contour Silver", stock: 6, sku: "KTA-ARTISAN-47-CS" },
      { name: "Color", value: "ice-blue", label: "Ice Blue", stock: 4, sku: "KTA-ARTISAN-47-IB" },
      { name: "Color", value: "cream", label: "Cream", stock: 3, sku: "KTA-ARTISAN-47-CR" },
    ],
  },
  {
    name: "Bosch Serie 8 Dishwasher 60cm",
    brand: "Bosch",
    categoryId: "",
    organizationId: "",
    slug: "bosch-serie-8-dishwasher-60cm",
    sku: "BOS-S8-DW-60",
    description: "Premium dishwasher with Zeolith drying. Serie 8 features 13 place settings, 6 programs including ExtraDry, and VarioDrawer for cutlery. 42dB quiet operation, Home Connect app, and A+++ energy rating.",
    price: 6999,
    comparePrice: 7999,
    stock: 18,
    weight: 42,
    tags: ["dishwasher", "bosch", "serie-8", "quiet", "smart", "energy-efficient", "zeolith"],
    images: [],
    variants: [
      { name: "Color", value: "stainless-steel", label: "Stainless Steel", stock: 10, sku: "BOS-S8-DW-60-SS" },
      { name: "Color", value: "black", label: "Black", stock: 8, sku: "BOS-S8-DW-60-BLK" },
    ],
  },

  // OFFICE (3 products)
  {
    name: "Herman Miller Aeron Ergonomic Chair",
    brand: "Herman Miller",
    categoryId: "",
    organizationId: "",
    slug: "herman-miller-aeron-ergonomic-chair",
    sku: "HM-AERON",
    description: "The most ergonomic chair in the world. Aeron features Pellicle mesh for breathability, PostureFit SL for spinal support, and fully adjustable arms. 12-year warranty, 95% recyclable, and certified for environmental standards.",
    price: 12999,
    comparePrice: 14999,
    stock: 15,
    weight: 18.6,
    tags: ["chair", "herman-miller", "aeron", "ergonomic", "office", "mesh", "adjustable"],
    images: [],
    variants: [
      { name: "Size", value: "a", label: "Size A", stock: 5, sku: "HM-AERON-A" },
      { name: "Size", value: "b", label: "Size B", stock: 5, sku: "HM-AERON-B" },
      { name: "Size", value: "c", label: "Size C", stock: 5, sku: "HM-AERON-C" },
    ],
  },
  {
    name: "IKEA BEKANT Standing Desk 160x80cm",
    brand: "IKEA",
    categoryId: "",
    organizationId: "",
    slug: "ikea-bekant-standing-desk-160x80cm",
    sku: "IKE-BEKANT-16080",
    description: "Versatile sit-stand desk for modern workspaces. BEKANT features electric height adjustment from 65cm to 125cm, cable management system, and white laminate top. Supports up to 70kg and includes anti-collision safety.",
    price: 3999,
    comparePrice: 4499,
    stock: 22,
    weight: 35,
    tags: ["desk", "ikea", "bekant", "standing", "electric", "adjustable", "office"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 12, sku: "IKE-BEKANT-16080-WHT" },
      { name: "Color", value: "black-brown", label: "Black/Brown", stock: 10, sku: "IKE-BEKANT-16080-BB" },
    ],
  },
  {
    name: "Philips Hue White & Color Ambiance Starter Kit",
    brand: "Philips",
    categoryId: "",
    organizationId: "",
    slug: "philips-hue-white-color-ambiance-starter-kit",
    sku: "PHL-HUE-START",
    description: "Transform your home with smart lighting. Hue starter kit includes 2 color bulbs, Hue Bridge, and control all lights with app or voice. 16 million colors, sync with music/movies, and scheduling capabilities.",
    price: 1999,
    comparePrice: 2299,
    stock: 45,
    weight: 1.2,
    tags: ["lighting", "philips", "hue", "smart", "rgb", "voice-control", "home-automation"],
    images: [],
    variants: [
      { name: "Bulb", value: "e27", label: "E27", stock: 25, sku: "PHL-HUE-START-E27" },
      { name: "Bulb", value: "e14", label: "E14", stock: 20, sku: "PHL-HUE-START-E14" },
    ],
  },

  // FASHION (3 products)
  {
    name: "Levi's 501 Original Fit Jeans",
    brand: "Levi's",
    categoryId: "",
    organizationId: "",
    slug: "levis-501-original-fit-jeans",
    sku: "LEV-501-ORG",
    description: "The original blue jeans since 1873. 501 Original Fit features straight leg, button fly, and sits at the waist. Made from premium denim with signature red tab, back patch, and copper rivets. Available in various washes.",
    price: 899,
    comparePrice: 999,
    stock: 85,
    weight: 0.7,
    tags: ["jeans", "levis", "501", "denim", "original", "straight-leg", "classic"],
    images: [],
    variants: [
      { name: "Size", value: "30", label: "30", stock: 12, sku: "LEV-501-ORG-30" },
      { name: "Size", value: "32", label: "32", stock: 15, sku: "LEV-501-ORG-32" },
      { name: "Size", value: "34", label: "34", stock: 15, sku: "LEV-501-ORG-34" },
      { name: "Size", value: "36", label: "36", stock: 12, sku: "LEV-501-ORG-36" },
      { name: "Size", value: "38", label: "38", stock: 10, sku: "LEV-501-ORG-38" },
      { name: "Size", value: "40", label: "40", stock: 10, sku: "LEV-501-ORG-40" },
      { name: "Size", value: "42", label: "42", stock: 11, sku: "LEV-501-ORG-42" },
    ],
  },
  {
    name: "Nike Air Max 270 React",
    brand: "Nike",
    categoryId: "",
    organizationId: "",
    slug: "nike-air-max-270-react",
    sku: "NIK-AM270R",
    description: "Iconic style meets all-day comfort. Air Max 270 React features the tallest Air unit yet with React foam cushioning. Breathable mesh upper, no-sew overlays, and rubber outsole with flex grooves for natural movement.",
    price: 1499,
    comparePrice: 1699,
    stock: 72,
    weight: 0.85,
    tags: ["shoes", "nike", "air-max", "270", "react", "running", "lifestyle"],
    images: [],
    variants: [
      { name: "Size", value: "40", label: "EU 40", stock: 10, sku: "NIK-AM270R-40" },
      { name: "Size", value: "41", label: "EU 41", stock: 12, sku: "NIK-AM270R-41" },
      { name: "Size", value: "42", label: "EU 42", stock: 12, sku: "NIK-AM270R-42" },
      { name: "Size", value: "43", label: "EU 43", stock: 12, sku: "NIK-AM270R-43" },
      { name: "Size", value: "44", label: "EU 44", stock: 12, sku: "NIK-AM270R-44" },
      { name: "Size", value: "45", label: "EU 45", stock: 8, sku: "NIK-AM270R-45" },
      { name: "Size", value: "46", label: "EU 46", stock: 6, sku: "NIK-AM270R-46" },
    ],
  },
  {
    name: "Ralph Lauren Polo Classic Fit Cotton T-Shirt",
    brand: "Ralph Lauren",
    categoryId: "",
    organizationId: "",
    slug: "ralph-lauren-polo-classic-fit-cotton-t-shirt",
    sku: "RL-POLO-TSHIRT",
    description: "The iconic Polo shirt. Classic fit cotton mesh t-shirt features embroidered pony logo, ribbed collar, and two-button placket. Breathable fabric, durable construction, and timeless style available in classic colors.",
    price: 799,
    comparePrice: 899,
    stock: 95,
    weight: 0.25,
    tags: ["t-shirt", "ralph-lauren", "polo", "cotton", "classic", "embroidered", "lifestyle"],
    images: [],
    variants: [
      { name: "Size", value: "s", label: "S", stock: 15, sku: "RL-POLO-TSHIRT-S" },
      { name: "Size", value: "m", label: "M", stock: 20, sku: "RL-POLO-TSHIRT-M" },
      { name: "Size", value: "l", label: "L", stock: 20, sku: "RL-POLO-TSHIRT-L" },
      { name: "Size", value: "xl", label: "XL", stock: 20, sku: "RL-POLO-TSHIRT-XL" },
      { name: "Size", value: "xxl", label: "XXL", stock: 15, sku: "RL-POLO-TSHIRT-XXL" },
      { name: "Size", value: "xxxl", label: "XXXL", stock: 5, sku: "RL-POLO-TSHIRT-XXXL" },
    ],
  },

  // BAGS (2 products)
  {
    name: "Samsonite Xenon 3.0 Spinner 55cm Carry-On",
    brand: "Samsonite",
    categoryId: "",
    organizationId: "",
    slug: "samsonite-xenon-3-0-spinner-55cm-carry-on",
    sku: "SAM-XEN3-55",
    description: "Premium carry-on luggage for modern travelers. Xenon 3.0 features 4-wheel spinner system, TSA-approved lock, and expandable design. Made from durable polycarbonate with scratch-resistant texture and integrated ID tag.",
    price: 2499,
    comparePrice: 2799,
    stock: 35,
    weight: 2.8,
    tags: ["luggage", "samsonite", "xenon", "carry-on", "spinner", "polycarbonate", "travel"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 18, sku: "SAM-XEN3-55-BLK" },
      { name: "Color", value: "navy", label: "Navy", stock: 17, sku: "SAM-XEN3-55-NVY" },
    ],
  },
  {
    name: "Herschel Heritage Backpack 25L",
    brand: "Herschel",
    categoryId: "",
    organizationId: "",
    slug: "herschel-heritage-backpack-25l",
    sku: "HER-HER-25L",
    description: "Classic everyday backpack. Heritage features signature striped liner, 15-inch laptop sleeve, and front pocket with key clip. Made from durable polyester with reinforced bottom and magnetic strap closures.",
    price: 699,
    comparePrice: 799,
    stock: 65,
    weight: 0.68,
    tags: ["backpack", "herschel", "heritage", "everyday", "laptop", "classic", "durable"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 22, sku: "HER-HER-25L-BLK" },
      { name: "Color", value: "navy", label: "Navy", stock: 22, sku: "HER-HER-25L-NVY" },
      { name: "Color", value: "grey", label: "Grey", stock: 21, sku: "HER-HER-25L-GRY" },
    ],
  },

  // BEAUTY (2 products)
  {
    name: "Dyson Airwrap Complete Long Hair Styler",
    brand: "Dyson",
    categoryId: "",
    organizationId: "",
    slug: "dyson-airwrap-complete-long-hair-styler",
    sku: "DYS-AW-COMP-L",
    description: "Revolutionary hair styling tool. Airwrap Complete uses Coanda effect to curl, wave, smooth, and dry hair without extreme heat. Includes barrels for curls, smoothing brushes, and round volumizing brush. For long hair.",
    price: 5999,
    comparePrice: 6499,
    stock: 28,
    weight: 0.9,
    tags: ["hair", "dyson", "airwrap", "styler", "curl", "no-heat", "professional"],
    images: [],
    variants: [
      { name: "Color", value: "nickel-copper", label: "Nickel/Copper", stock: 14, sku: "DYS-AW-COMP-L-NC" },
      { name: "Color", value: "fuchsia-iron", label: "Fuchsia/Iron", stock: 14, sku: "DYS-AW-COMP-L-FI" },
    ],
  },
  {
    name: "Foreo Luna 3 Facial Cleansing Brush",
    brand: "Foreo",
    categoryId: "",
    organizationId: "",
    slug: "foreo-luna-3-facial-cleansing-brush",
    sku: "FOR-LUNA3",
    description: "Advanced facial cleansing device. Luna 3 features T-Sonic pulsations for deep cleansing, anti-aging firming massage, and adjustable intensity. 100% waterproof, silicone brush head, and up to 650 uses per charge.",
    price: 1999,
    comparePrice: 2299,
    stock: 42,
    weight: 0.1,
    tags: ["skincare", "foreo", "luna", "cleansing", "anti-aging", "silicone", "waterproof"],
    images: [],
    variants: [
      { name: "Type", value: "normal", label: "Normal Skin", stock: 22, sku: "FOR-LUNA3-NORM" },
      { name: "Type", value: "combination", label: "Combination Skin", stock: 20, sku: "FOR-LUNA3-COMB" },
    ],
  },

  // HEALTH (2 products)
  {
    name: "Withings Body Cardio Smart Scale",
    brand: "Withings",
    categoryId: "",
    organizationId: "",
    slug: "withings-body-cardio-smart-scale",
    sku: "WIT-BC",
    description: "Advanced body composition scale. Body Cardio measures weight, body fat, water percentage, muscle mass, and bone mass. Features vascular age assessment, pregnancy tracking, and syncs with Health Mate app. WiFi and Bluetooth connectivity.",
    price: 1799,
    comparePrice: 1999,
    stock: 38,
    weight: 2.5,
    tags: ["scale", "withings", "body-composition", "smart", "health", "wifi", "cardio"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 20, sku: "WIT-BC-WHT" },
      { name: "Color", value: "black", label: "Black", stock: 18, sku: "WIT-BC-BLK" },
    ],
  },
  {
    name: "Omron M7 Intelli IT Blood Pressure Monitor",
    brand: "Omron",
    categoryId: "",
    organizationId: "",
    slug: "omron-m7-intelli-it-blood-pressure-monitor",
    sku: "OMR-M7-IT",
    description: "Professional blood pressure monitor. M7 Intelli IT features Intelli Wrap cuff for accurate readings, irregular heartbeat detection, and evening hypertension indicator. Stores up to 100 readings and syncs with Omron Connect app.",
    price: 1299,
    comparePrice: 1499,
    stock: 45,
    weight: 0.35,
    tags: ["blood-pressure", "omron", "monitor", "health", "smart", "cuff", "app"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 23, sku: "OMR-M7-IT-WHT" },
      { name: "Color", value: "black", label: "Black", stock: 22, sku: "OMR-M7-IT-BLK" },
    ],
  },

  // FITNESS (2 products)
  {
    name: "NordicTrack Commercial 1750 Treadmill",
    brand: "NordicTrack",
    categoryId: "",
    organizationId: "",
    slug: "nordictrack-commercial-1750-treadmill",
    sku: "NT-C1750",
    description: "Premium home treadmill with iFit. Commercial 1750 features 10-inch HD touchscreen, -3% to 15% incline, and 12 mph auto-adjust speed. 3.75 CHP motor, 0-12 MPH speed, and 30-year motor warranty.",
    price: 14999,
    comparePrice: 16999,
    stock: 12,
    weight: 113,
    tags: ["treadmill", "nordictrack", "ifit", "running", "home-gym", "incline", "hd-screen"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 12, sku: "NT-C1750-BLK" },
    ],
  },
  {
    name: "Bowflex SelectTech 552 Adjustable Dumbbells",
    brand: "Bowflex",
    categoryId: "",
    organizationId: "",
    slug: "bowflex-selecttech-552-adjustable-dumbbells",
    sku: "BWF-ST552",
    description: "Space-saving adjustable dumbbells. SelectTech 552 replaces 15 sets of weights with dial adjustment from 2.3kg to 23.8kg. Unique locking mechanism, ergonomic grip, and durable construction. Includes stand sold separately.",
    price: 4999,
    comparePrice: 5499,
    stock: 25,
    weight: 24,
    tags: ["dumbbells", "bowflex", "selecttech", "adjustable", "weights", "home-gym", "space-saving"],
    images: [],
    variants: [
      { name: "Set", value: "pair", label: "Pair", stock: 15, sku: "BWF-ST552-PAIR" },
      { name: "Set", value: "single", label: "Single", stock: 10, sku: "BWF-ST552-SINGLE" },
    ],
  },

  // BABY (2 products)
  {
    name: "Babyzen YOYO2 Stroller 6+ Color Pack",
    brand: "Babyzen",
    categoryId: "",
    organizationId: "",
    slug: "babyzen-yoyo2-stroller-6-color-pack",
    sku: "BZY-YOYO2-6",
    description: "The iconic compact stroller. YOYO2 folds into a cabin-approved size, weighs only 6.2kg, and features one-hand fold. Includes 6+ color pack, multi-position recline, and premium suspension for smooth ride.",
    price: 4999,
    comparePrice: 5499,
    stock: 18,
    weight: 6.2,
    tags: ["stroller", "babyzen", "yoyo2", "compact", "travel", "lightweight", "baby"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 6, sku: "BZY-YOYO2-6-BLK" },
      { name: "Color", value: "grey", label: "Grey", stock: 6, sku: "BZY-YOYO2-6-GRY" },
      { name: "Color", value: "taupe", label: "Taupe", stock: 6, sku: "BZY-YOYO2-6-TAU" },
    ],
  },
  {
    name: "Philips Avent Natural Baby Bottle 260ml",
    brand: "Philips",
    categoryId: "",
    organizationId: "",
    slug: "philips-avent-natural-baby-bottle-260ml",
    sku: "PHL-AV-NAT-260",
    description: "Natural feeding for baby. Avent Natural bottle features wide breast-shaped nipple for natural latch, anti-colic valve to reduce discomfort, and BPA-free material. Easy to clean and dishwasher safe.",
    price: 149,
    comparePrice: 179,
    stock: 150,
    weight: 0.12,
    tags: ["baby-bottle", "philips", "avent", "natural", "anti-colic", "bpa-free", "feeding"],
    images: [],
    variants: [
      { name: "Size", value: "260ml", label: "260ml", stock: 75, sku: "PHL-AV-NAT-260-1" },
      { name: "Size", value: "330ml", label: "330ml", stock: 75, sku: "PHL-AV-NAT-260-2" },
    ],
  },

  // TOYS (2 products)
  {
    name: "LEGO Technic Bugatti Chiron 42083",
    brand: "LEGO",
    categoryId: "",
    organizationId: "",
    slug: "lego-technic-bugatti-chiron-42083",
    sku: "LEG-TEC-42083",
    description: "Ultimate supercar replica. LEGO Technic Bugatti Chiron features 3599 pieces, W16 engine with moving pistons, and authentic details. Working steering, 8-speed gearbox, and exclusive Bugatti key. For ages 16+.",
    price: 3499,
    comparePrice: 3999,
    stock: 22,
    weight: 2.9,
    tags: ["lego", "technic", "bugatti", "chiron", "car", "building", "collectible"],
    images: [],
    variants: [
      { name: "Set", value: "42083", label: "42083", stock: 22, sku: "LEG-TEC-42083" },
    ],
  },
  {
    name: "Barbie Dreamhouse Dollhouse",
    brand: "Barbie",
    categoryId: "",
    organizationId: "",
    slug: "barbie-dreamhouse-dollhouse",
    sku: "BAR-DREAMHOUSE",
    description: "The ultimate Barbie home. Dreamhouse features 3 stories, 8 rooms, and 70+ accessories. Working elevator, pool with slide, and lights and sounds. Fits Barbie dolls and friends for endless imaginative play.",
    price: 2499,
    comparePrice: 2799,
    stock: 28,
    weight: 15,
    tags: ["barbie", "dollhouse", "dreamhouse", "toys", "playset", "accessories", "kids"],
    images: [],
    variants: [
      { name: "Edition", value: "standard", label: "Standard", stock: 28, sku: "BAR-DREAMHOUSE-STD" },
    ],
  },

  // FURNITURE (2 products)
  {
    name: "West Elm Mid-Century Modern Sofa",
    brand: "West Elm",
    categoryId: "",
    organizationId: "",
    slug: "west-elm-mid-century-modern-sofa",
    sku: "WE-MCM-SOFA",
    description: "Iconic mid-century design sofa. Features tapered wood legs, tufted back cushions, and premium fabric upholstery. Kiln-dried hardwood frame, high-density foam cushions, and available in multiple fabric colors.",
    price: 14999,
    comparePrice: 16999,
    stock: 12,
    weight: 55,
    tags: ["sofa", "west-elm", "mid-century", "modern", "furniture", "upholstered", "living-room"],
    images: [],
    variants: [
      { name: "Color", value: "gray", label: "Gray", stock: 4, sku: "WE-MCM-SOFA-GRY" },
      { name: "Color", value: "navy", label: "Navy", stock: 4, sku: "WE-MCM-SOFA-NVY" },
      { name: "Color", value: "cream", label: "Cream", stock: 4, sku: "WE-MCM-SOFA-CRM" },
    ],
  },
  {
    name: "IKEA MALM Bed Frame High Queen Size",
    brand: "IKEA",
    categoryId: "",
    organizationId: "",
    slug: "ikea-malm-bed-frame-high-queen-size",
    sku: "IKE-MALM-Q-H",
    description: "Classic bed frame with storage. MALM High features 4 large drawers underneath, solid wood construction, and slatted bed base. Available in white, black-brown, or oak veneer finish. Easy assembly.",
    price: 3999,
    comparePrice: 4499,
    stock: 18,
    weight: 45,
    tags: ["bed", "ikea", "malm", "queen", "storage", "drawers", "bedroom"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 6, sku: "IKE-MALM-Q-H-WHT" },
      { name: "Color", value: "black-brown", label: "Black/Brown", stock: 6, sku: "IKE-MALM-Q-H-BB" },
      { name: "Color", value: "oak", label: "Oak", stock: 6, sku: "IKE-MALM-Q-H-OAK" },
    ],
  },

  // LIGHTING (2 products)
  {
    name: "Artemide Tolomeo Mega Floor Lamp",
    brand: "Artemide",
    categoryId: "",
    organizationId: "",
    slug: "artemide-tolomeo-mega-floor-lamp",
    sku: "ART-TOL-MEGA",
    description: "Iconic adjustable floor lamp. Tolomeo Mega features fully adjustable articulated arm, diffuser for soft light, and weighted base for stability. Aluminum construction with matte finish and dimmable LED bulb included.",
    price: 4999,
    comparePrice: 5499,
    stock: 15,
    weight: 8.5,
    tags: ["lamp", "artemide", "tolomeo", "floor-lamp", "adjustable", "led", "design"],
    images: [],
    variants: [
      { name: "Color", value: "white", label: "White", stock: 8, sku: "ART-TOL-MEGA-WHT" },
      { name: "Color", value: "black", label: "Black", stock: 7, sku: "ART-TOL-MEGA-BLK" },
    ],
  },
  {
    name: "FLOS IC Lights S Pendant Lamp",
    brand: "FLOS",
    categoryId: "",
    organizationId: "",
    slug: "flos-ic-lights-s-pendant-lamp",
    sku: "FLO-IC-S",
    description: "Elegant pendant lamp with sphere diffuser. IC Lights S features blown glass sphere, steel stem, and dimmable LED. Perfect for dining tables, kitchen islands, or as accent lighting. Available in multiple finishes.",
    price: 2999,
    comparePrice: 3299,
    stock: 20,
    weight: 2.1,
    tags: ["lamp", "flos", "ic", "pendant", "led", "glass", "modern"],
    images: [],
    variants: [
      { name: "Finish", value: "chrome", label: "Chrome", stock: 7, sku: "FLO-IC-S-CHR" },
      { name: "Finish", value: "brass", label: "Brass", stock: 7, sku: "FLO-IC-S-BRS" },
      { name: "Finish", value: "black", label: "Black", stock: 6, sku: "FLO-IC-S-BLK" },
    ],
  },

  // AUTOMOTIVE (2 products)
  {
    name: "Garmin DriveSmart 65 GPS Navigator",
    brand: "Garmin",
    categoryId: "",
    organizationId: "",
    slug: "garmin-drivesmart-65-gps-navigator",
    sku: "GAR-DS65",
    description: "Advanced GPS navigation with smart features. DriveSmart 65 features 6.95-inch edge-to-edge display, voice-activated navigation, and driver alerts. Includes lifetime maps, traffic updates, and Bluetooth for hands-free calling.",
    price: 2499,
    comparePrice: 2799,
    stock: 32,
    weight: 0.27,
    tags: ["gps", "garmin", "navigation", "automotive", "traffic", "bluetooth", "maps"],
    images: [],
    variants: [
      { name: "Model", value: "65", label: "DriveSmart 65", stock: 32, sku: "GAR-DS65-65" },
    ],
  },
  {
    name: "Anker Roav SmartCharge F0 Car Charger",
    brand: "Anker",
    categoryId: "",
    organizationId: "",
    slug: "anker-roav-smartcharge-f0-car-charger",
    sku: "ANK-RSC-F0",
    description: "Smart car charger with Bluetooth FM transmitter. Roav SmartCharge F0 features PowerIQ for fast charging, Bluetooth 5.0 for music streaming, and built-in microphone for hands-free calls. LED display and dual USB ports.",
    price: 499,
    comparePrice: 599,
    stock: 85,
    weight: 0.05,
    tags: ["car-charger", "anker", "roav", "bluetooth", "fm-transmitter", "usb", "automotive"],
    images: [],
    variants: [
      { name: "Color", value: "black", label: "Black", stock: 85, sku: "ANK-RSC-F0-BLK" },
    ],
  },

  // PET SUPPLIES (2 products)
  {
    name: "PetSafe Automatic Pet Feeder",
    brand: "PetSafe",
    categoryId: "",
    organizationId: "",
    slug: "petsafe-automatic-pet-feeder",
    sku: "PTS-AUTO-FEED",
    description: "Programmable automatic pet feeder. Features up to 12 meals per day, portion control from 1/8 cup to 4 cups, and voice recording. Battery backup, dishwasher-safe parts, and works with dry or semi-moist food.",
    price: 1299,
    comparePrice: 1499,
    stock: 38,
    weight: 2.8,
    tags: ["pet-feeder", "petsafe", "automatic", "dog", "cat", "programmable", "food"],
    images: [],
    variants: [
      { name: "Size", value: "small", label: "Small (up to 4 cups)", stock: 19, sku: "PTS-AUTO-FEED-S" },
      { name: "Size", value: "large", label: "Large (up to 24 cups)", stock: 19, sku: "PTS-AUTO-FEED-L" },
    ],
  },
  {
    name: "KONG Classic Dog Toy",
    brand: "KONG",
    categoryId: "",
    organizationId: "",
    slug: "kong-classic-dog-toy",
    sku: "KONG-CLASSIC",
    description: "The world's best dog toy. KONG Classic features natural rubber for durability, unpredictable bounce for fetch, and can be stuffed with treats for mental stimulation. Available in multiple sizes for all breeds.",
    price: 149,
    comparePrice: 179,
    stock: 120,
    weight: 0.15,
    tags: ["dog-toy", "kong", "classic", "rubber", "chew", "treat-stuffing", "durable"],
    images: [],
    variants: [
      { name: "Size", value: "xs", label: "Extra Small", stock: 20, sku: "KONG-CLASSIC-XS" },
      { name: "Size", value: "s", label: "Small", stock: 25, sku: "KONG-CLASSIC-S" },
      { name: "Size", value: "m", label: "Medium", stock: 25, sku: "KONG-CLASSIC-M" },
      { name: "Size", value: "l", label: "Large", stock: 25, sku: "KONG-CLASSIC-L" },
      { name: "Size", value: "xl", label: "Extra Large", stock: 25, sku: "KONG-CLASSIC-XL" },
    ],
  },
];

async function main() {
  console.log("🚀 Starting product seed process...");

  try {
    const organization = await prisma.organization.findFirst({
      where: { name: { contains: "NexMart" } },
    });

    if (!organization) {
      console.error("❌ No organization found. Please create an organization first.");
      return;
    }

    console.log(`✅ Found organization: ${organization.name} (${organization.id})`);

    const existingCategories = await prisma.category.findMany({
      where: { organizationId: organization.id },
    });

    const categoryMap = new Map<string, string>();
    
    for (const cat of categories) {
      let category = existingCategories.find((c) => c.slug === cat.slug);
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            organizationId: organization.id,
            name: cat.name,
            slug: cat.slug,
            description: `${cat.name} products at NexMart`,
          },
        });
        console.log(`✅ Created category: ${cat.name}`);
      }
      
      categoryMap.set(cat.slug, category.id);
    }

    console.log(`✅ Total categories: ${categoryMap.size}`);

    let createdCount = 0;
    let skippedCount = 0;
    const errors: Array<{ product: string; error: string }> = [];

    const productCategoryMap: Record<string, string> = {
      "iphone-15-pro-max-256gb": "smartphones",
      "samsung-galaxy-s24-ultra-512gb": "smartphones",
      "google-pixel-8-pro-256gb": "smartphones",
      "xiaomi-14-ultra-512gb": "smartphones",
      "macbook-pro-16-m3-max-36gb-1tb": "laptops",
      "dell-xps-15-9530-i9-32gb-1tb": "laptops",
      "lenovo-thinkpad-x1-carbon-gen-12-i7-32gb-512gb": "laptops",
      "asus-rog-zephyrus-g16-ryzen-9-32gb-1tb-rtx-4080": "laptops",
      "ipad-pro-12-9-m4-256gb-wifi": "tablets",
      "samsung-galaxy-tab-s9-ultra-256gb": "tablets",
      "microsoft-surface-pro-11-snapdragon-x-elite-16gb-512gb": "tablets",
      "apple-watch-ultra-2-49mm-gps-cellular": "smart-watches",
      "samsung-galaxy-watch-6-classic-47mm-lte": "smart-watches",
      "garmin-fenix-7-pro-solar-47mm": "smart-watches",
      "sony-wh-1000xm5-wireless-noise-cancelling": "headphones",
      "bose-quietcomfort-ultra-noise-cancelling": "headphones",
      "apple-airpods-max-wireless-over-ear": "headphones",
      "playstation-5-slim-1tb-digital-edition": "gaming",
      "xbox-series-x-1tb": "gaming",
      "nintendo-switch-oled-model-64gb": "gaming",
      "keychron-q1-pro-qmk-via-wireless-custom-keyboard": "keyboards",
      "logitech-mx-mechanical-wireless-keyboard": "keyboards",
      "razer-blackwidow-v4-pro-mechanical-keyboard": "keyboards",
      "logitech-mx-master-3s-wireless-mouse": "mice",
      "razer-deathadder-v3-pro-wireless-gaming-mouse": "mice",
      "apple-magic-mouse-2-wireless": "mice",
      "lg-ultragear-27gp850-27-165hz-ips-gaming-monitor": "monitors",
      "dell-ultrasharp-u2723qe-27-4k-usb-c-hub-monitor": "monitors",
      "samsung-odyssey-oled-g9-49-240hz-curved-gaming-monitor": "monitors",
      "sony-alpha-7-iv-mirrorless-camera-body": "cameras",
      "canon-eos-r6-mark-ii-mirrorless-camera-body": "cameras",
      "fujifilm-x-t5-mirrorless-camera-body": "cameras",
      "dyson-v15-detect-absolute-cordless-vacuum": "home-appliances",
      "philips-airfryer-xxl-premium-digital": "kitchen",
      "roborock-s8-pro-ultra-robot-vacuum-mop": "home-appliances",
      "nespresso-vertuo-next-coffee-machine": "kitchen",
      "kitchenaid-stand-mixer-4-7l-artisan": "kitchen",
      "bosch-serie-8-dishwasher-60cm": "kitchen",
      "herman-miller-aeron-ergonomic-chair": "office",
      "ikea-bekant-standing-desk-160x80cm": "office",
      "philips-hue-white-color-ambiance-starter-kit": "lighting",
      "levis-501-original-fit-jeans": "fashion",
      "nike-air-max-270-react": "shoes",
      "ralph-lauren-polo-classic-fit-cotton-t-shirt": "fashion",
      "samsonite-xenon-3-0-spinner-55cm-carry-on": "bags",
      "herschel-heritage-backpack-25l": "bags",
      "dyson-airwrap-complete-long-hair-styler": "beauty",
      "foreo-luna-3-facial-cleansing-brush": "beauty",
      "withings-body-cardio-smart-scale": "health",
      "omron-m7-intelli-it-blood-pressure-monitor": "health",
      "nordictrack-commercial-1750-treadmill": "fitness",
      "bowflex-selecttech-552-adjustable-dumbbells": "fitness",
      "babyzen-yoyo2-stroller-6-color-pack": "baby",
      "philips-avent-natural-baby-bottle-260ml": "baby",
      "lego-technic-bugatti-chiron-42083": "toys",
      "barbie-dreamhouse-dollhouse": "toys",
      "west-elm-mid-century-modern-sofa": "furniture",
      "ikea-malm-bed-frame-high-queen-size": "furniture",
      "artemide-tolomeo-mega-floor-lamp": "lighting",
      "flos-ic-lights-s-pendant-lamp": "lighting",
      "garmin-drivesmart-65-gps-navigator": "automotive",
      "anker-roav-smartcharge-f0-car-charger": "automotive",
      "petsafe-automatic-pet-feeder": "pet-supplies",
      "kong-classic-dog-toy": "pet-supplies",
    };

    for (const product of products) {
      try {
        const categorySlug = productCategoryMap[product.slug] || "smartphones";
        const categoryId = categoryMap.get(categorySlug);

        if (!categoryId) {
          console.warn(`⚠️  No category found for ${product.name} (slug: ${categorySlug})`);
          continue;
        }

        const existingProduct = await prisma.product.findUnique({
          where: {
            organizationId_sku: {
              organizationId: organization.id,
              sku: product.sku,
            },
          },
        });

        if (existingProduct) {
          console.log(`⏭️  Skipped existing product: ${product.name}`);
          skippedCount++;
          continue;
        }

        const createdProduct = await prisma.product.create({
          data: {
            organizationId: organization.id,
            categoryId: categoryId,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice,
            stock: product.stock,
            weight: product.weight,
            tags: product.tags,
            images: product.images,
            published: true,
            featured: createdCount < 10,
          },
        });

        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            await prisma.productVariant.create({
              data: {
                productId: createdProduct.id,
                name: variant.name,
                value: variant.value,
                label: variant.label,
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku,
              },
            });
          }
        }

        console.log(`✅ Created product: ${product.name} (SKU: ${product.sku})`);
        createdCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error creating ${product.name}: ${errorMessage}`);
        errors.push({ product: product.name, error: errorMessage });
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 PRODUCT SEED REPORT");
    console.log("=".repeat(50));
    console.log(`✅ Products created: ${createdCount}`);
    console.log(`⏭️  Products skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`📦 Total products in database: ${createdCount + skippedCount}`);
    console.log(`🏷️  Categories used: ${categoryMap.size}`);

    if (errors.length > 0) {
      console.log("\n❌ ERRORS:");
      errors.forEach((err) => {
        console.log(`  - ${err.product}: ${err.error}`);
      });
    }

    const categoryDistribution = await prisma.product.groupBy({
      by: ["categoryId"],
      where: { organizationId: organization.id },
      _count: true,
    });

    console.log("\n📊 CATEGORY DISTRIBUTION:");
    for (const dist of categoryDistribution) {
      const cat = await prisma.category.findUnique({ where: { id: dist.categoryId } });
      console.log(`  - ${cat?.name}: ${dist._count} products`);
    }

  } catch (error) {
    console.error("❌ Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

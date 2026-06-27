export type ProductImageView = "FRONT" | "SIDE" | "BACK" | "TOP" | "FORTY_FIVE_DEGREE" | "CLOSE_UP" | "LIFESTYLE_SCENE" | "PACKAGING_SHOT";

export interface ProductData {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  color?: string;
  material?: string;
  features?: string[];
  targetAudience?: string;
  price?: number;
  tags?: string[];
}

export interface GeneratedPrompt {
  viewType: ProductImageView;
  prompt: string;
  imageType: string;
}

export class ProductImagePromptGenerator {
  private baseQualityPrompt = "Professional commercial product photography. Ultra realistic, photorealistic, professional studio lighting, soft shadows, real reflections, high detail, premium quality, natural colors, commercial product photography style similar to Amazon, Apple Store, Nike, Adidas, Samsung, and Shopify product photography.";

  private backgroundPrompt = "Clean white background (#FFFFFF) or light gray (#F8F8F8). No distracting elements.";

  private negativePrompt = "No watermark, no text, no logo, no labels, no fake UI, no borders, no stickers, no frames. Only the product.";

  generatePrompts(productData: ProductData): GeneratedPrompt[] {
    const prompts: GeneratedPrompt[] = [];

    const viewTypes: ProductImageView[] = [
      "FRONT",
      "FORTY_FIVE_DEGREE",
      "SIDE",
      "BACK",
      "TOP",
      "CLOSE_UP",
      "LIFESTYLE_SCENE",
      "PACKAGING_SHOT",
    ];

    for (const viewType of viewTypes) {
      prompts.push(this.generatePromptForView(productData, viewType));
    }

    return prompts;
  }

  generatePromptForView(productData: ProductData, viewType: ProductImageView): GeneratedPrompt {
    const productDescription = this.buildProductDescription(productData);
    const viewSpecificPrompt = this.getViewSpecificPrompt(viewType, productData);
    const lifestyleContext = viewType === "LIFESTYLE_SCENE" ? this.buildLifestyleContext(productData) : "";

    const prompt = `${this.baseQualityPrompt} ${productDescription} ${viewSpecificPrompt} ${lifestyleContext} ${this.backgroundPrompt} ${this.negativePrompt}`;

    return {
      viewType,
      prompt: prompt.replace(/\s+/g, " ").trim(),
      imageType: this.getImageTypeForView(viewType),
    };
  }

  private buildProductDescription(productData: ProductData): string {
    const parts: string[] = [];

    parts.push(productData.name);

    if (productData.category) {
      parts.push(productData.category);
    }

    if (productData.brand) {
      parts.push(`by ${productData.brand}`);
    }

    if (productData.color) {
      parts.push(`in ${productData.color}`);
    }

    if (productData.material) {
      parts.push(`made of ${productData.material}`);
    }

    if (productData.features && productData.features.length > 0) {
      parts.push(`featuring ${productData.features.slice(0, 3).join(", ")}`);
    }

    return parts.join(", ");
  }

  private getViewSpecificPrompt(viewType: ProductImageView, productData: ProductData): string {
    const viewPrompts: Record<ProductImageView, string> = {
      FRONT: "Front view, centered composition, product facing forward, symmetrical framing.",
      FORTY_FIVE_DEGREE: "45-degree angle view, dynamic composition, showing depth and dimension, slight perspective.",
      SIDE: "Side view, 90-degree angle, profile shot, showing product profile.",
      BACK: "Back view, 180-degree angle, rear perspective, showing back features.",
      TOP: "Top view, overhead shot, bird's eye perspective, aerial photography style.",
      CLOSE_UP: "Extreme close-up detail shot, macro photography, focusing on intricate details and textures.",
      LIFESTYLE_SCENE: "",
      PACKAGING_SHOT: "Product packaging shot, branded packaging, box design, retail packaging presentation.",
    };

    return viewPrompts[viewType];
  }

  private buildLifestyleContext(productData: ProductData): string {
    const category = productData.category?.toLowerCase() || "";
    
    const lifestyleContexts: Record<string, string> = {
      electronics: "Product in modern office setup, clean desk, professional environment, ambient lighting.",
      headphones: "Headphones on modern desk, professional workspace, clean aesthetic, premium setup.",
      laptop: "Laptop in premium office, modern desk setup, professional environment, clean background.",
      phone: "Smartphone in modern lifestyle setting, clean aesthetic, premium environment.",
      watch: "Watch on wrist, lifestyle photography, premium setting, elegant composition.",
      shoes: "Shoes worn by model, lifestyle photography, modern setting, dynamic pose.",
      clothing: "Clothing on model, lifestyle photography, modern aesthetic, professional lighting.",
      furniture: "Furniture inside modern living room, interior design, premium home setting, natural lighting.",
      kitchen: "Kitchen appliance inside modern kitchen, interior design, clean aesthetic, home setting.",
      home: "Home product in modern interior, lifestyle photography, clean home setting, natural light.",
      sports: "Sports equipment in action, dynamic photography, athletic setting, professional lighting.",
      beauty: "Beauty product in elegant setting, luxury aesthetic, professional photography, soft lighting.",
      accessories: "Accessory in lifestyle setting, modern aesthetic, premium presentation.",
    };

    for (const [key, context] of Object.entries(lifestyleContexts)) {
      if (category.includes(key)) {
        return context;
      }
    }

    return "Product in modern lifestyle setting, clean aesthetic, professional environment.";
  }

  private getImageTypeForView(viewType: ProductImageView): string {
    const imageTypes: Record<ProductImageView, string> = {
      FRONT: "MAIN",
      FORTY_FIVE_DEGREE: "GALLERY",
      SIDE: "GALLERY",
      BACK: "GALLERY",
      TOP: "GALLERY",
      CLOSE_UP: "DETAIL",
      LIFESTYLE_SCENE: "LIFESTYLE",
      PACKAGING_SHOT: "PACKAGING",
    };

    return imageTypes[viewType];
  }

  generateSEOFilename(productData: ProductData, viewType: ProductImageView): string {
    const parts: string[] = [];

    if (productData.brand) {
      parts.push(productData.brand.toLowerCase().replace(/\s+/g, "-"));
    }

    parts.push(productData.name.toLowerCase().replace(/\s+/g, "-"));

    if (productData.color) {
      parts.push(productData.color.toLowerCase().replace(/\s+/g, "-"));
    }

    parts.push(viewType.toLowerCase().replace(/_/g, "-"));

    return `${parts.join("-")}.webp`;
  }

  generateAltText(productData: ProductData, viewType: ProductImageView): string {
    const viewDescriptions: Record<ProductImageView, string> = {
      FRONT: "front view",
      FORTY_FIVE_DEGREE: "45-degree angle view",
      SIDE: "side view",
      BACK: "back view",
      TOP: "top view",
      CLOSE_UP: "close-up detail",
      LIFESTYLE_SCENE: "lifestyle shot",
      PACKAGING_SHOT: "packaging",
    };

    const viewDesc = viewDescriptions[viewType];
    const parts: string[] = [productData.name];

    if (productData.brand) {
      parts.push(`by ${productData.brand}`);
    }

    parts.push(viewDesc);

    if (productData.color) {
      parts.push(`in ${productData.color}`);
    }

    return parts.join(" ");
  }

  generateImageTitle(productData: ProductData, viewType: ProductImageView): string {
    const viewDescriptions: Record<ProductImageView, string> = {
      FRONT: "Front View",
      FORTY_FIVE_DEGREE: "45° View",
      SIDE: "Side View",
      BACK: "Back View",
      TOP: "Top View",
      CLOSE_UP: "Close-up Detail",
      LIFESTYLE_SCENE: "Lifestyle",
      PACKAGING_SHOT: "Packaging",
    };

    const viewDesc = viewDescriptions[viewType];
    return `${productData.name} ${viewDesc}`;
  }

  generateCaption(productData: ProductData, viewType: ProductImageView): string {
    if (viewType === "LIFESTYLE_SCENE") {
      return `${productData.name} in a modern lifestyle setting, showcasing its design and functionality in a real-world context.`;
    }

    if (viewType === "CLOSE_UP") {
      return `Detailed close-up of ${productData.name}, highlighting its premium materials and craftsmanship.`;
    }

    return `${productData.name} ${viewType.toLowerCase().replace(/_/g, " ")} view, showcasing its design and features.`;
  }
}

export function createPromptGenerator(): ProductImagePromptGenerator {
  return new ProductImagePromptGenerator();
}

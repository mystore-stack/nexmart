import OpenAI from "openai";

export interface ImageGenerationOptions {
  prompt: string;
  model?: "dall-e-3" | "dall-e-2";
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number;
}

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

export class OpenAIImageGenerator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
    const {
      prompt,
      model = "dall-e-3",
      size = "1024x1024",
      quality = "hd",
      style = "natural",
      n = 1,
    } = options;

    try {
      const response = await this.client.images.generate({
        model,
        prompt,
        size,
        quality,
        style,
        n,
        response_format: "url",
      });

      const image = response.data[0];
      return {
        url: image.url!,
        revisedPrompt: image.revised_prompt,
      };
    } catch (error) {
      console.error("OpenAI Image Generation Error:", error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateMultipleImages(
    prompts: string[],
    options?: Omit<ImageGenerationOptions, "prompt">
  ): Promise<GeneratedImage[]> {
    const results: GeneratedImage[] = [];

    for (const prompt of prompts) {
      try {
        const image = await this.generateImage({ ...options, prompt });
        results.push(image);
      } catch (error) {
        console.error(`Failed to generate image for prompt: ${prompt}`, error);
        results.push({
          url: "",
          revisedPrompt: prompt,
        });
      }
    }

    return results;
  }

  async generateProductImage(
    productName: string,
    category: string,
    viewType: string,
    additionalContext?: string
  ): Promise<GeneratedImage> {
    const prompt = this.buildProductPrompt(productName, category, viewType, additionalContext);
    return this.generateImage({
      prompt,
      model: "dall-e-3",
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });
  }

  private buildProductPrompt(
    productName: string,
    category: string,
    viewType: string,
    additionalContext?: string
  ): string {
    const basePrompt = `Professional commercial product photography of ${productName}, ${category}. Ultra realistic, photorealistic, professional studio lighting, soft shadows, real reflections, high detail, premium quality, natural colors, commercial product photography style similar to Amazon, Apple Store, Nike, Adidas, Samsung, and Shopify product photography.`;

    const viewPrompts: Record<string, string> = {
      FRONT: `${basePrompt} Front view, centered composition, clean white background (#FFFFFF).`,
      SIDE: `${basePrompt} Side view, 90-degree angle, clean white background (#FFFFFF).`,
      BACK: `${basePrompt} Back view, 180-degree angle, clean white background (#FFFFFF).`,
      TOP: `${basePrompt} Top view, overhead shot, clean white background (#FFFFFF).`,
      FORTY_FIVE_DEGREE: `${basePrompt} 45-degree angle view, dynamic composition, clean white background (#FFFFFF).`,
      CLOSE_UP: `${basePrompt} Extreme close-up detail shot, macro photography, clean white background (#FFFFFF).`,
      LIFESTYLE_SCENE: `${basePrompt} Lifestyle scene, product in realistic usage context, modern aesthetic, professional lighting.`,
      PACKAGING_SHOT: `${basePrompt} Product packaging shot, branded packaging, clean white background (#FFFFFF).`,
    };

    const viewPrompt = viewPrompts[viewType] || viewPrompts.FRONT;
    const context = additionalContext ? ` ${additionalContext}.` : "";

    return `${viewPrompt}${context} No watermark, no text, no logo, no labels, no fake UI, no borders, no stickers, no frames. Only the product.`;
  }
}

export function createOpenAIImageGenerator(): OpenAIImageGenerator {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAIImageGenerator(apiKey);
}

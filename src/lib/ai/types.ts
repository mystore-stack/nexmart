export type AiLocale = "fr" | "ar" | "en" | "darija";

export type AiChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type SearchIntent = {
  query: string;
  normalizedQuery: string;
  language: AiLocale;
  category?: string | null;
  budget?: { min?: number | null; max?: number | null };
  attributes: string[];
  intent: "browse" | "compare" | "buy" | "support" | "unknown";
};

export type RecommendationContext = "homepage" | "related" | "cart" | "post_purchase" | "chat";

export type AiGeneratedContent = {
  title?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  altText?: string;
  emailSubject?: string;
  emailBody?: string;
  pushTitle?: string;
  pushBody?: string;
  tags?: string[];
  keyFeatures?: string[];
};

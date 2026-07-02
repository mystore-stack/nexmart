import type { PageSection } from "../types";

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: PageSection[];
  thumbnail?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockTemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

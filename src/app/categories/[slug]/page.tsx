// src/app/categories/[slug]/page.tsx
import CategoryPage, { generateMetadata as categoryMetadata } from "@/app/category/[slug]/page";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata(props: Props) {
  return categoryMetadata(props);
}

export default async function CategoriesSlugPage(props: Props) {
  return <CategoryPage {...props} />;
}

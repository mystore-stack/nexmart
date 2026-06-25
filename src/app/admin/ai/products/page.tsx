import AIProductManager from "@/components/admin/ai-products/AIProductManager";
import { getAIProductManagerBootstrap } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAIProductsPage() {
  const initialData = await getAIProductManagerBootstrap();
  return <AIProductManager initialData={initialData} />;
}

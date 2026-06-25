import type { Metadata } from "next";
import { AiEngineerDashboard } from "@/components/admin/ai/AiEngineerDashboard";

export const metadata: Metadata = {
  title: "AI Error Center | NexMart Admin",
};

export default function AdminAiErrorsPage() {
  return <AiEngineerDashboard view="errors" />;
}

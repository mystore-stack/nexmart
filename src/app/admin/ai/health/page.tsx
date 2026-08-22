import type { Metadata } from "next";
import { AiEngineerDashboard } from "@/components/admin/ai/AiEngineerDashboard";

export const metadata: Metadata = {
  title: "AI Health Monitor | NexMart Admin",
};

export default function AdminAiHealthPage() {
  return <AiEngineerDashboard view="health" />;
}

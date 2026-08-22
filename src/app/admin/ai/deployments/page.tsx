import type { Metadata } from "next";
import { AiEngineerDashboard } from "@/components/admin/ai/AiEngineerDashboard";

export const metadata: Metadata = {
  title: "AI Deployment Center | NexMart Admin",
};

export default function AdminAiDeploymentsPage() {
  return <AiEngineerDashboard view="deployments" />;
}

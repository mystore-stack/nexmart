import type { Metadata } from "next";
import { AiEngineerDashboard } from "@/components/admin/ai/AiEngineerDashboard";

export const metadata: Metadata = {
  title: "AI Engineer Dashboard | NexMart Admin",
  description: "AI diagnostics, audits, health checks, database inspection, and deployment monitoring.",
};

export default function AdminAiPage() {
  return <AiEngineerDashboard view="overview" />;
}

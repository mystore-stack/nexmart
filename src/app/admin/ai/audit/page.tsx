import type { Metadata } from "next";
import { AiEngineerDashboard } from "@/components/admin/ai/AiEngineerDashboard";

export const metadata: Metadata = {
  title: "AI Project Audit | NexMart Admin",
};

export default function AdminAiAuditPage() {
  return <AiEngineerDashboard view="audit" />;
}

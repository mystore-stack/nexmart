import type { Metadata } from "next";
import { AiEngineerDashboard } from "@/components/admin/ai/AiEngineerDashboard";

export const metadata: Metadata = {
  title: "AI Chat Engineer | NexMart Admin",
};

export default function AdminAiChatPage() {
  return <AiEngineerDashboard view="chat" />;
}

import AISettingsPanel from "@/components/admin/settings/AISettingsPanel";
import { getAISettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAISettingsPage() {
  const settings = await getAISettings();
  return <AISettingsPanel settings={settings} />;
}

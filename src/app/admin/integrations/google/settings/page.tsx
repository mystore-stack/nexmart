import { GoogleSettings } from "@/components/admin/integrations/google/GoogleSettings";
import { requireAdmin } from "@/lib/auth-server";

export default async function GoogleSettingsPage() {
  const { organizationId } = await requireAdmin();

  return (
    <div className="container mx-auto py-8">
      <GoogleSettings organizationId={organizationId} />
    </div>
  );
}

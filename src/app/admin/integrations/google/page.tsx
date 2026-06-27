import { GoogleIntegrationDashboard } from "@/components/admin/integrations/google/GoogleIntegrationDashboard";
import { requireAdmin } from "@/lib/auth-server";

export default async function GoogleIntegrationsPage() {
  const { organizationId } = await requireAdmin();

  return (
    <div className="container mx-auto py-8">
      <GoogleIntegrationDashboard organizationId={organizationId} />
    </div>
  );
}

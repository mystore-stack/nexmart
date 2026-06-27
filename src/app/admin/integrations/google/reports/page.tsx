import { GoogleReports } from "@/components/admin/integrations/google/GoogleReports";
import { requireAdmin } from "@/lib/auth-server";

export default async function GoogleReportsPage() {
  const { organizationId } = await requireAdmin();

  return (
    <div className="container mx-auto py-8">
      <GoogleReports organizationId={organizationId} />
    </div>
  );
}

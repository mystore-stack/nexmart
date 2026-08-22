import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { SourcingForm } from "./SourcingForm";

export const metadata = {
  title: "Product Sourcing | Admin",
  description: "Import real products from external suppliers into NexMart",
};

export default async function SourcingPage() {
  const { organizationId } = await requireAdmin();

  const categories = await prisma.category.findMany({
    where: { organizationId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Sourcing</h2>
          <p className="text-muted-foreground">
            Import real products from external suppliers into NexMart.
          </p>
        </div>
      </div>
      <SourcingForm categories={categories} />
    </div>
  );
}

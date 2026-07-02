import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";

async function publishHomepage() {
  console.log("Publishing HOME page...");

  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) {
    console.error("No organization ID found");
    process.exit(1);
  }

  const now = new Date();

  // Find the HOME page
  const homePage = await prisma.pageBuilderPage.findFirst({
    where: {
      organizationId,
      pageType: "HOME",
    },
  });

  if (!homePage) {
    console.error("No HOME page found");
    process.exit(1);
  }

  console.log("Found HOME page:", homePage.id, homePage.name);
  console.log("Current status:", homePage.status, "Enabled:", homePage.enabled);

  // Update to PUBLISHED
  const updated = await prisma.pageBuilderPage.update({
    where: { id: homePage.id },
    data: {
      status: "PUBLISHED",
      enabled: true,
      publishDate: now,
      unpublishDate: null,
    },
  });

  console.log("Updated HOME page:", updated.id, updated.name);
  console.log("New status:", updated.status, "Enabled:", updated.enabled);
  console.log("Published:", updated.publishDate);
  process.exit(0);
}

publishHomepage().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

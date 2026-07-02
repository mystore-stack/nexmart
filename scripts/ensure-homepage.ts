import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";

async function ensureHomepage() {
  console.log("Checking for HOME page...");

  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) {
    console.error("No organization ID found");
    process.exit(1);
  }

  const now = new Date();

  // Check if a HOME page exists
  const existingPage = await prisma.pageBuilderPage.findFirst({
    where: {
      organizationId,
      pageType: "HOME",
    },
  });

  if (existingPage) {
    console.log("HOME page already exists:", existingPage.id, existingPage.name);
    console.log("Status:", existingPage.status, "Enabled:", existingPage.enabled);
    console.log("Published:", existingPage.publishDate, "Unpublished:", existingPage.unpublishDate);
    process.exit(0);
  }

  console.log("No HOME page found. Creating one...");

  // Create a default HOME page
  const homePage = await prisma.pageBuilderPage.create({
    data: {
      organizationId,
      name: "Home",
      slug: "home",
      pageType: "HOME",
      status: "PUBLISHED",
      enabled: true,
      featured: false,
      displayOrder: 0,
      publishDate: new Date(),
      unpublishDate: null,
      seoTitle: "NexMart Maroc — Marketplace Premium",
      seoDescription: "Découvrez la marketplace premium du Maroc — artisanat authentique, produits sélectionnés par IA, paiement sécurisé et livraison express.",
      canonicalUrl: null,
      ogImage: null,
      twitterImage: null,
      accentColor: null,
      sectionBackground: null,
      buttonStyle: null,
      cardStyle: null,
      borderRadius: null,
      shadow: null,
      gradient: null,
    },
  });

  console.log("Created HOME page:", homePage.id, homePage.name);
  process.exit(0);
}

ensureHomepage().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";

async function checkHomepageSections() {
  console.log("Checking HOME page sections...");

  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) {
    console.error("No organization ID found");
    process.exit(1);
  }

  const homePage = await prisma.pageBuilderPage.findFirst({
    where: {
      organizationId,
      pageType: "HOME",
    },
    include: {
      sections: true,
    },
  });

  if (!homePage) {
    console.log("No HOME page found");
    process.exit(0);
  }

  console.log("HOME page:", homePage.id, homePage.name, homePage.status);
  console.log("Sections count:", homePage.sections.length);
  
  homePage.sections.forEach((section, index) => {
    console.log(`Section ${index}:`, section.id, section.sectionType, section.enabled);
    console.log("Config:", JSON.stringify(section.config, null, 2));
  });

  process.exit(0);
}

checkHomepageSections().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

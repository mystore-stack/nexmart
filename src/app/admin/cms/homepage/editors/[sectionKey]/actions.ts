"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { HeroConfigurationV2 } from "@/lib/cms/schemas/hero-v2";

export async function updateSectionConfig(id: string, config: any) {
  try {
    console.log("[UPDATE SECTION CONFIG] Updating section:", id);
    console.log("[UPDATE SECTION CONFIG] Config keys:", Object.keys(config));
    console.log("[UPDATE SECTION CONFIG] Has heroV2:", !!config.heroV2);
    console.log("[UPDATE SECTION CONFIG] Has composition:", !!config.composition);
    
    // If V2 config is present, validate it
    if (config.heroV2) {
      console.log("[UPDATE SECTION CONFIG] Validating V2 configuration");
      // The V2 schema validation happens in the component, but we can add additional validation here if needed
      console.log("[UPDATE SECTION CONFIG] V2 config structure:", {
        hasMedia: !!config.heroV2.media,
        hasFrame: !!config.heroV2.frame,
        hasPosition: !!config.heroV2.position,
        hasResponsive: !!config.heroV2.responsive,
        hasContent: !!config.heroV2.content,
        hasAdvanced: !!config.heroV2.advanced,
      });
    }
    
    const updateData: any = { config: config };
    
    await prisma.homePageSection.update({
      where: { id },
      data: updateData,
    });

    console.log("[UPDATE SECTION CONFIG] Database updated successfully");
    
    // Revalidate homepage cache
    revalidatePath("/");
    revalidatePath("/admin/cms/homepage");
    revalidateTag("homepage");
    revalidateTag("hero");
    
    console.log("[UPDATE SECTION CONFIG] Cache revalidated");
    
    return { success: true };
  } catch (error) {
    console.error("[UPDATE SECTION CONFIG] Error:", error);
    return { success: false, error: "Failed to update section configuration" };
  }
}

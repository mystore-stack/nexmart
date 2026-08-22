"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSectionConfig(id: string, config: any) {
  await prisma.homePageSection.update({
    where: { id },
    data: { 
      config: config
    },
  });

  revalidatePath("/");
  revalidatePath(`/admin/cms/homepage/editors`);
  return { success: true };
}

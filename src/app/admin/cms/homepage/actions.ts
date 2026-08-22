"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSectionOrder(updates: { id: string; displayOrder: number }[]) {
  // Update the orders in a transaction
  await prisma.$transaction(
    updates.map((u) =>
      prisma.homePageSection.update({
        where: { id: u.id },
        data: { displayOrder: u.displayOrder },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin/cms/homepage");
  return { success: true };
}

export async function toggleSectionEnabled(id: string, active: boolean) {
  await prisma.homePageSection.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms/homepage");
  return { success: true };
}

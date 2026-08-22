import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Lien invalide ou expiré" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetExpires: null },
    });

    return NextResponse.json({ success: true, message: "Mot de passe mis à jour" });
  } catch {
    return NextResponse.json({ success: false, error: "Données invalides" }, { status: 422 });
  }
}

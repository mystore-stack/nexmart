import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/api";
import { sendPasswordReset } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Trop de demandes." }, { status: 429 });
    }

    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });

    if (user) {
      const token = nanoid(32);
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetExpires },
      });
      await sendPasswordReset(user.email, user.name, token);
    }

    return NextResponse.json({
      success: true,
      message: "Si un compte existe, un e-mail de réinitialisation a été envoyé.",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Requête invalide" }, { status: 422 });
  }
}

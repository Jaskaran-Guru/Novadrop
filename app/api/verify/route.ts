import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token } = z.object({
      email: z.string().email(),
      token: z.string(),
    }).parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationToken !== token) {
      return NextResponse.json({ error: "Invalid email or verification token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

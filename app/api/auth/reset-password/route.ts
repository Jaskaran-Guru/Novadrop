import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "request") {
      const { email } = z.object({ email: z.string().email() }).parse(body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Return 200 for security to prevent email enumeration
        return NextResponse.json({ success: true, message: "If the email exists, a reset code was sent." });
      }

      // Generate a mock token
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: token },
      });

      console.log(`\n========================================\n[SIMULATION] PASSWORD RESET REQUEST\nUser: ${email}\nReset Code: ${token}\nReset Link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}\n========================================\n`);

      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset code was sent. Check server logs.",
        mockToken: token // Exposed for developer ease in testing
      });
    }

    if (action === "reset") {
      const { email, token, password } = z.object({
        email: z.string().email(),
        token: z.string(),
        password: z.string().min(6),
      }).parse(body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.verificationToken !== token) {
        return NextResponse.json({ error: "Invalid email or reset token" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          verificationToken: null, // clear token
        },
      });

      return NextResponse.json({ success: true, message: "Password reset successfully!" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

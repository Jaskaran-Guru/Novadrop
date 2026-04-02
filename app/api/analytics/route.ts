import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || "guest";
  
  try {
    const body = await req.json();
    const { eventType, metadata, page } = body;

    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        sessionId: "client_" + Date.now(),
        userId,
        metadata: metadata || {},
        page: page || "",
      }
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

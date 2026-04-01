import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventType,
      sessionId,
      userId,
      productId,
      orderId,
      page,
      value,
      abVariant,
      metadata,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = body;

    if (!eventType || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        eventType,
        sessionId,
        userId: userId || null,
        productId: productId || null,
        orderId: orderId || null,
        page: page || null,
        value: value || null,
        abVariant: abVariant || null,
        metadata: metadata || null,
        utmSource: utm_source || null,
        utmMedium: utm_medium || null,
        utmCampaign: utm_campaign || null,
        utmContent: utm_content || null,
        utmTerm: utm_term || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

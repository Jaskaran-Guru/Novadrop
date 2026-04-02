import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { addMockOrder } from "@/lib/demo-state";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || "guest";

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { items, customerEmail, customerName, shippingAddress, utmParams, abVariant } = body;

  try {
    const lineItems = items.map(
      (item: { name: string; price: number; image: string; quantity: number }) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || "Guest",
        shippingAddress: JSON.stringify(shippingAddress || {}),
        utmSource: utmParams?.utm_source || "",
        utmMedium: utmParams?.utm_medium || "",
        utmCampaign: utmParams?.utm_campaign || "",
        utmContent: utmParams?.utm_content || "",
        abVariant: abVariant || "",
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id, url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    
    // DEMO FALLBACK: If Stripe fails (unconfigured/offline), simulate a successful redirect.
    if (!process.env.STRIPE_SECRET_KEY || error.raw?.type === "invalid_request_error" || error.message?.includes("API key")) {
      console.warn("DEMO MODE: Stripe unconfigured. Redirecting to mock success.");
      
      const mockOrderId = "mock_" + Date.now();
      const mockTotal = items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;
      
      try {
        await prisma.order.create({
          data: {
            id: mockOrderId,
            status: "PENDING",
            total: mockTotal,
            subtotal: mockTotal,
            customerEmail: customerEmail || "guest@example.com",
            customerName: customerName || "Guest User",
            shippingAddress: shippingAddress || {},
            userId: userId === "guest" ? null : userId,
            utmSource: utmParams?.utm_source || null,
            utmMedium: utmParams?.utm_medium || null,
            utmCampaign: utmParams?.utm_campaign || null,
            items: {
              create: items?.map((item: any) => ({
                productId: item.productId || item.id?.split('-')[0], 
                quantity: item.quantity,
                price: item.price
              })).filter((i: any) => i.productId) || []
            }
          }
        });
      } catch (dbError) {
        console.warn("Neon DB offline or error writing. Falling back to Demo State Cookies.", dbError);
        // Save order to demo state
        await addMockOrder(userId, {
          id: mockOrderId,
          customerEmail: customerEmail || "guest@example.com",
          customerName: customerName || "Guest User",
          status: "PENDING",
          total: mockTotal,
          items: items?.map((item: any) => ({
            product: { name: item.name },
            price: item.price,
            quantity: item.quantity
          })),
          createdAt: new Date().toISOString()
        });
      }

      // Log tracking event
      await prisma.analyticsEvent.create({
        data: {
          eventType: "checkout_start",
          sessionId: "session_" + Date.now(),
          userId: userId,
          metadata: { 
            mock: true, 
            customerEmail: customerEmail || "guest@example.com",
            total: items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0
          },
          utmSource: utmParams?.utm_source || "",
          utmMedium: utmParams?.utm_medium || "",
          utmCampaign: utmParams?.utm_campaign || "",
          abVariant: abVariant || "",
        },
      }).catch(() => {});

      return NextResponse.json({ 
        sessionId: "mock_session_" + Date.now(), 
        url: `${process.env.NEXT_PUBLIC_APP_URL}/success?mock=true` 
      });
    }

    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  } finally {
    // Log as long as we have valid items
    if (items && items.length > 0) {
      await prisma.analyticsEvent.create({
        data: {
          eventType: "checkout_start",
          sessionId: "session_" + Date.now(),
          userId: userId,
          metadata: { 
            itemCount: items.length,
            customerEmail: customerEmail || "guest@example.com"
          },
          utmSource: utmParams?.utm_source || "",
          utmMedium: utmParams?.utm_medium || "",
          utmCampaign: utmParams?.utm_campaign || "",
          abVariant: abVariant || "",
        },
      }).catch(() => {});
    }
  }
}

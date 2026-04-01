import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, customerName, shippingAddress, utmParams, abVariant } =
      await req.json();

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: customerEmail,
      metadata: {
        customerName,
        shippingAddress: JSON.stringify(shippingAddress),
        utmSource: utmParams?.utm_source || "",
        utmMedium: utmParams?.utm_medium || "",
        utmCampaign: utmParams?.utm_campaign || "",
        utmContent: utmParams?.utm_content || "",
        abVariant: abVariant || "",
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}

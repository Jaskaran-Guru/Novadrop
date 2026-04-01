import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    const items = JSON.parse(metadata.items || "[]") as Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;

    try {
      await prisma.order.create({
        data: {
          status: "PAID",
          total: (session.amount_total || 0) / 100,
          subtotal: (session.amount_subtotal || 0) / 100,
          customerEmail: session.customer_email || "",
          customerName: metadata.customerName || "Customer",
          shippingAddress: JSON.parse(metadata.shippingAddress || "{}"),
          stripePaymentId: session.payment_intent as string,
          stripeSessionId: session.id,
          utmSource: metadata.utmSource || null,
          utmMedium: metadata.utmMedium || null,
          utmCampaign: metadata.utmCampaign || null,
          utmContent: metadata.utmContent || null,
          abVariant: metadata.abVariant || null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    } catch (e) {
      console.error("Error creating order from webhook:", e);
    }
  }

  return NextResponse.json({ received: true });
}

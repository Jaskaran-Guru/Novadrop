import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || null;

  try {
    const body = await req.json();
    const { items, customerEmail, customerName, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in checkout" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    
    // Add standard shipping fee under ₹999
    const shipping = subtotal >= 999 ? 0 : 99;
    const tax = 0;
    const total = subtotal + shipping + tax;

    // Direct transaction placement: PAID for card/upi, PENDING for cash on delivery
    const orderStatus = paymentMethod === "COD" ? "PENDING" : "PAID";

    // Deduct stock and write order records in a single database transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Deduct stock inventories
      for (const item of items) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!prod || prod.inventory < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.name || 'Item'}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: orderStatus,
          subtotal,
          shipping,
          tax,
          total,
          customerEmail,
          customerName,
          shippingAddress,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true }
              }
            }
          }
        }
      });

      return newOrder;
    });

    // Generate analytical purchase event
    await prisma.analyticsEvent.create({
      data: {
        eventType: "purchase",
        sessionId: "session_" + Date.now(),
        userId,
        productId: items[0]?.productId || null,
        orderId: order.id,
        value: total,
        metadata: {
          paymentMethod,
          itemCount: items.length,
          direct: true
        }
      }
    }).catch(() => {});

    return NextResponse.json({ success: true, orderId: order.id, order });
  } catch (error: any) {
    console.error("Direct checkout placement error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order." }, { status: 500 });
  }
}

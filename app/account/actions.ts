"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { removeMockOrder } from "@/lib/demo-state";

export async function cancelAndRefundOrder(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, status: true },
    });

    if (!order) {
      
      await removeMockOrder(session.user.id, orderId);
      revalidatePath("/account");
      return { success: true, mocked: true };
    }

    if (order.userId !== session.user.id) {
      return { success: false, error: "Unauthorized access." };
    }

    if (order.status !== "PENDING") {
      return { success: false, error: "Only pending orders can be cancelled and refunded." };
    }

    
    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidatePath("/account");
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error: any) {
    if (error?.name === "PrismaClientInitializationError") {
      
      await removeMockOrder(session.user.id, orderId);
      revalidatePath("/account");
      return { success: true, mocked: true };
    }
    return { success: false, error: "Database operation failed." };
  }
}

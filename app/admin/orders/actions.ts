"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateMockOrder, removeMockOrder } from "@/lib/demo-state";

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
    revalidatePath("/admin/orders");
    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    const isRecordNotFound = error?.code === "P2025";
    const isDbOffline = error?.name === "PrismaClientInitializationError";

    if (isRecordNotFound || isDbOffline) {
      await updateMockOrder(session.user.id, orderId, status);
      revalidatePath("/admin/orders");
      revalidatePath("/account");
      return { success: true, mocked: true };
    }
    return { success: false, error: "Failed to update status." };
  } finally {
    // Log tracking event for live dashboard
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "update_order_status", orderId, status },
      },
    }).catch(() => {});
  }
}

export async function deleteOrder(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.order.delete({
      where: { id: orderId },
    });
    revalidatePath("/admin/orders");
    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    const isRecordNotFound = error?.code === "P2025";
    const isDbOffline = error?.name === "PrismaClientInitializationError";

    if (isRecordNotFound || isDbOffline) {
      await removeMockOrder(session.user.id, orderId);
      revalidatePath("/admin/orders");
      revalidatePath("/account");
      return { success: true, mocked: true };
    }
    return { success: false, error: "Failed to delete order." };
  } finally {
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "delete_order", orderId },
      },
    }).catch(() => {});
  }
}

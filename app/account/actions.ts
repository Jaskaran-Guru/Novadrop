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

export async function updateProfileName(name: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update name" };
  }
}

export async function addAddress(data: {
  type: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    if (data.isDefault) {
      // Set all other user addresses to not default
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        type: data.type,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault || false,
      },
    });

    revalidatePath("/account");
    return { success: true, address };
  } catch (error) {
    return { success: false, error: "Failed to add address" };
  }
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.address.delete({
      where: { id: addressId, userId: session.user.id },
    });
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete address" };
  }
}

export async function toggle2FASetting(enabled: boolean, secret?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: enabled,
        ...(secret ? { twoFactorSecret: secret } : {}),
      },
    });
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update 2FA" };
  }
}

export async function exportUserData() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        addresses: true,
        orders: { include: { items: { include: { product: true } } } },
        reviews: true,
        wishlist: { include: { product: true } },
      },
    });
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to export data" };
  }
}

export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const userId = session.user.id;
    // Delete user from DB. Prisma onDelete: Cascade will delete accounts, sessions, addresses, reviews, wishlist.
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete account" };
  }
}

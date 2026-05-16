"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { setMockUserState } from "@/lib/demo-state";
import { auth } from "@/auth";

export async function toggleUserSuspension(userId: string, currentStatus: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const newStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus as any },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    
    const isRecordNotFound = error?.code === "P2025";
    const isDbOffline = error?.name === "PrismaClientInitializationError";

    if (isRecordNotFound || isDbOffline) {
      const newStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
      await setMockUserState(session.user.id, userId, { status: newStatus });
      revalidatePath("/admin/users");
      return { success: true, mocked: true };
    }
    
    console.error("User Action Error (Toggle):", error);
    return { success: false, error: "Failed to toggle suspension." };
  } finally {
    
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "toggle_user_status", targetUserId: userId },
      },
    }).catch(() => {}); 
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    const isRecordNotFound = error?.code === "P2025";
    const isDbOffline = error?.name === "PrismaClientInitializationError";

    if (isRecordNotFound || isDbOffline) {
      await setMockUserState(session.user.id, userId, { role: newRole });
      revalidatePath("/admin/users");
      return { success: true, mocked: true };
    }

    console.error("User Action Error (Role):", error);
    return { success: false, error: `Failed to update role: ${error.message}` };
  } finally {
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "update_user_role", targetUserId: userId, role: newRole },
      },
    }).catch(() => {});
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    const isRecordNotFound = error?.code === "P2025";
    const isDbOffline = error?.name === "PrismaClientInitializationError";

    if (isRecordNotFound || isDbOffline) {
      await setMockUserState(session.user.id, userId, { status: "DELETED" });
      revalidatePath("/admin/users");
      return { success: true, mocked: true };
    }

    console.error("User Action Error (Delete):", error);
    return { success: false, error: "Failed to delete user." };
  } finally {
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "delete_user", targetUserId: userId },
      },
    }).catch(() => {});
  }
}

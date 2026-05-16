"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createCampaign(data: {
  name: string;
  platform: string;
  status: string;
  budget: number;
  startDate: string;
  endDate?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const campaign = await prisma.adCampaign.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "create_campaign", campaignId: campaign.id, name: campaign.name },
      },
    });

    revalidatePath("/admin/campaigns");
    return { success: true, campaign };
  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return { success: false, error: "Database error. Could not create campaign." };
  }
}

export async function updateCampaign(id: string, data: Partial<{
  name: string;
  platform: string;
  status: string;
  budget: number;
  spend: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
  startDate: string;
  endDate?: string;
}>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const campaign = await prisma.adCampaign.update({
      where: { id },
      data: updateData,
    });

    
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "update_campaign", campaignId: id, updates: Object.keys(data) },
      },
    });

    revalidatePath("/admin/campaigns");
    return { success: true, campaign };
  } catch (error: any) {
    console.error("Failed to update campaign:", error);
    return { success: false, error: "Database error. Could not update campaign." };
  }
}

export async function deleteCampaign(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await prisma.adCampaign.delete({
      where: { id },
    });

    
    await prisma.analyticsEvent.create({
      data: {
        eventType: "admin_action",
        sessionId: "system",
        userId: session.user.id,
        metadata: { action: "delete_campaign", campaignId: id },
      },
    });

    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete campaign:", error);
    return { success: false, error: "Database error. Could not delete campaign." };
  }
}

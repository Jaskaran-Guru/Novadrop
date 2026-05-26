"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function checkIsInWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });
    return !!item;
  } catch {
    return false;
  }
}

export async function toggleWishlistItem(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required to use wishlist." };
  }

  try {
    const userId = session.user.id;
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: { userId, productId },
        },
      });
      revalidatePath(`/products`);
      return { success: true, inWishlist: false };
    } else {
      await prisma.wishlistItem.create({
        data: { userId, productId },
      });
      revalidatePath(`/products`);
      return { success: true, inWishlist: true };
    }
  } catch (error) {
    return { success: false, error: "Failed to update wishlist." };
  }
}

export async function submitProductReview(productId: string, rating: number, comment: string) {
  const session = await auth();
  
  // Support both logged-in and guest names
  const userId = session?.user?.id || null;
  const name = session?.user?.name || "Guest Buyer";
  const email = session?.user?.email || "guest@example.com";

  try {
    // Check if verified purchaser
    let verified = false;
    if (userId) {
      const purchaseCount = await prisma.order.count({
        where: {
          userId,
          status: "PAID",
          items: {
            some: { productId },
          },
        },
      });
      if (purchaseCount > 0) {
        verified = true;
      }
    } else {
      // Check if guest email placed a paid order with this product
      const guestPurchaseCount = await prisma.order.count({
        where: {
          customerEmail: email,
          status: "PAID",
          items: {
            some: { productId },
          },
        },
      });
      if (guestPurchaseCount > 0) {
        verified = true;
      }
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        name,
        rating,
        comment,
        verified,
      },
    });

    revalidatePath(`/products/[slug]`, "layout");
    return { success: true, review };
  } catch (error) {
    console.error("Review error:", error);
    return { success: false, error: "Failed to submit review." };
  }
}

export async function voteReviewHelpful(reviewId: string) {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

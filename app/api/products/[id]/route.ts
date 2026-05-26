import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  return (session?.user as any)?.role === "ADMIN";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Clean up input fields to ensure they match prisma schema types
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.comparePrice !== undefined) {
      updateData.comparePrice = body.comparePrice ? parseFloat(body.comparePrice) : null;
    }
    if (body.category !== undefined) updateData.category = body.category;
    if (body.inventory !== undefined) updateData.inventory = parseInt(body.inventory);
    if (body.featured !== undefined) updateData.featured = !!body.featured;
    if (body.active !== undefined) updateData.active = !!body.active;
    if (body.images !== undefined) {
      updateData.images = Array.isArray(body.images) ? body.images : [body.images].filter(Boolean);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product deletion failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

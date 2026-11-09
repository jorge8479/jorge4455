import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/coupons";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ coupons: getCoupons() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { code, description, discountPercent, maxUses, expiresAt } = body;

    if (!code || typeof code !== "string") return NextResponse.json({ error: "Code required" }, { status: 400 });
    if (!discountPercent || discountPercent < 1 || discountPercent > 100) return NextResponse.json({ error: "Discount 1-100%" }, { status: 400 });
    if (!maxUses || maxUses < 1) return NextResponse.json({ error: "Max uses required" }, { status: 400 });
    if (!expiresAt) return NextResponse.json({ error: "Expiry date required" }, { status: 400 });

    const coupon = createCoupon({ code, description: description || "", discountPercent, maxUses, expiresAt });
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const coupon = updateCoupon(id, data);
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const ok = deleteCoupon(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

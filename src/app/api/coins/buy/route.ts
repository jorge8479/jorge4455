import { NextRequest, NextResponse } from "next/server";
import { requirePlayerAuth } from "@/lib/auth";
import { createPayPalOrder, getCoinPackages } from "@/lib/coins";

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePlayerAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { packageId } = await req.json();
    if (!packageId) return NextResponse.json({ error: "Package ID required" }, { status: 400 });

    const packages = await getCoinPackages();
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    const order = await createPayPalOrder(pkg.coins, pkg.price, auth.accountName);
    if (!order) return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });

    return NextResponse.json({ orderId: order.id, approvalUrl: order.approvalUrl });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

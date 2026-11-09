import { NextRequest, NextResponse } from "next/server";
import { requirePlayerAuth } from "@/lib/auth";
import { capturePayPalOrder, grantCoins, addPurchaseTransaction, getCoinPackages } from "@/lib/coins";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePlayerAuth(req);
    if (!auth) return NextResponse.redirect(new URL("/login?error=auth", req.url));

    const orderId = req.nextUrl.searchParams.get("token");
    if (!orderId) return NextResponse.redirect(new URL("/coins?error=no_order", req.url));

    const result = await capturePayPalOrder(orderId);
    if (!result.success) return NextResponse.redirect(new URL("/coins?error=payment_failed", req.url));

    const coins = parseInt(req.nextUrl.searchParams.get("coins") || "0");
    const price = parseFloat(req.nextUrl.searchParams.get("price") || "0");

    if (coins > 0) {
      const grantResult = await grantCoins(auth.accountName, coins, "System", "PayPal Purchase");
      if (grantResult && grantResult.success) {
        await addPurchaseTransaction({
          type: "purchase",
          account: auth.accountName,
          player: auth.accountName,
          amount: coins,
          balanceAfter: grantResult.newBalance || 0,
          paymentMethod: "PayPal",
          paymentId: orderId,
        });
      }
    }

    return NextResponse.redirect(new URL(`/coins?success=paid&coins=${coins}`, req.url));
  } catch {
    return NextResponse.redirect(new URL("/coins?error=internal", req.url));
  }
}

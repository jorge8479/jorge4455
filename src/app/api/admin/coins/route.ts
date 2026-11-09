import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { grantCoins, removeCoins, getPlayerCoins } from "@/lib/coins";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, target, amount, reason } = await req.json();
    if (!action || !target || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    let result;
    if (action === "grant") {
      result = await grantCoins(target, amount, auth.accountName || "Admin", reason || "Admin action");
    } else if (action === "remove") {
      result = await removeCoins(target, amount, auth.accountName || "Admin", reason || "Admin action");
    } else if (action === "get") {
      result = await getPlayerCoins(target);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!result) return NextResponse.json({ error: "Failed to execute command" }, { status: 500 });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

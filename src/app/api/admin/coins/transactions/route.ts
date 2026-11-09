import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { getCoinTransactions } from "@/lib/coins";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await getCoinTransactions();
    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json({ transactions: [] });
  }
}

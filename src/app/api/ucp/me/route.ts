import { NextResponse } from "next/server";
import { getPlayerSession } from "@/lib/auth";
import { getMtaPlayer } from "@/lib/mtasa";

export async function GET() {
  try {
    const accountName = await getPlayerSession();
    if (!accountName) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const player = await getMtaPlayer(accountName);
    if (!player) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ player });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

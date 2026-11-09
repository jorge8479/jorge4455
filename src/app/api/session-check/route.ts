import { NextResponse } from "next/server";
import { getPlayerSession } from "@/lib/auth";

export async function GET() {
  try {
    const account = await getPlayerSession();
    return NextResponse.json({ loggedIn: !!account, account: account || null });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}

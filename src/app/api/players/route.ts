import { NextResponse } from "next/server";
import { getMtaPlayers } from "@/lib/mtasa";

export const dynamic = "force-dynamic";

export async function GET() {
  const players = await getMtaPlayers();

  if (!players) {
    return NextResponse.json({ players: [], total: 0 });
  }

  return NextResponse.json({ players, total: players.length });
}

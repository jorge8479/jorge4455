import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getLiveServerStatus, getLivePlayers } from "@/lib/mtasa";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [status, players] = await Promise.all([
      getLiveServerStatus(),
      getLivePlayers(),
    ]);

    return NextResponse.json({
      status: status || { online: false, serverName: "NightSide Roleplay", playerCount: 0, maxPlayers: 100, uptime: "N/A", uptimeSeconds: 0, timestamp: 0, gamemode: "Roleplay", mapName: "San Andreas", version: "1.6.0" },
      players: players || { count: 0, players: [], timestamp: 0 },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getLiveServerStatus, getLivePlayers } from "@/lib/mtasa";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const liveStatus = await getLiveServerStatus();
  const livePlayers = await getLivePlayers();

  return NextResponse.json({
    online: liveStatus?.online ?? false,
    players: livePlayers?.count ?? 0,
    maxPlayers: liveStatus?.maxPlayers ?? 100,
    name: liveStatus?.serverName ?? "NightSide Roleplay",
    gamemode: liveStatus?.gamemode ?? "Roleplay",
    mapName: liveStatus?.mapName ?? "San Andreas",
    uptime: liveStatus?.uptime ?? "N/A",
    version: liveStatus?.version ?? "1.6.0",
    playerList: livePlayers?.players?.slice(0, 10).map((p) => ({
      name: p.name,
      score: p.level,
      ping: 0,
    })) ?? [],
  });
}

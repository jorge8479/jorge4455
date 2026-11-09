import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getServerLogs } from "@/lib/mtasa";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // filter by type
    const search = searchParams.get("search"); // search by player/account
    const limit = parseInt(searchParams.get("limit") || "100");

    const logsData = await getServerLogs();
    if (!logsData) return NextResponse.json({ logs: [], count: 0 });

    let logs = logsData.logs;

    if (type && type !== "all") {
      logs = logs.filter((l) => l.type === type);
    }

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.player.toLowerCase().includes(q) ||
          l.account.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
      );
    }

    logs = logs.slice(0, limit);

    return NextResponse.json({ logs, count: logs.length });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

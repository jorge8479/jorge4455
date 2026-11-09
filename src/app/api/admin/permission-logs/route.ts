import { NextResponse } from "next/server";
import { getPermissionLogs } from "@/lib/mtasa";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await getPermissionLogs(100);
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Failed to load permission logs" }, { status: 500 });
  }
}

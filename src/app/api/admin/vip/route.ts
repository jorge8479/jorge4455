import { NextResponse } from "next/server";
import { sendServerCommand, sanitizeAccountName } from "@/lib/mtasa";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, account, vipType } = body;

    if (action === "list") {
      const result = await sendServerCommand("vip list");
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
      return NextResponse.json({ success: true, message: "Check server console" });
    }

    const safeAccount = sanitizeAccountName(account);
    if (!safeAccount) {
      return NextResponse.json({ error: "Invalid account name" }, { status: 400 });
    }

    if (action === "grant") {
      const validTypes = ["vip", "gold", "diamond"];
      const safeVipType = validTypes.includes(vipType) ? vipType : "vip";
      const vipLevel = safeVipType === "diamond" ? 3 : safeVipType === "gold" ? 2 : 1;
      const result = await sendServerCommand(`vip grant ${safeAccount} ${vipLevel}`);
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
      return NextResponse.json({ success: true, message: `VIP ${safeVipType} granted to ${safeAccount}` });
    }

    if (action === "revoke") {
      const result = await sendServerCommand(`vip revoke ${safeAccount}`);
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
      return NextResponse.json({ success: true, message: `VIP revoked from ${safeAccount}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

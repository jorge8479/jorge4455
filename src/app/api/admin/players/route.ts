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
    const { action, account, value } = body;

    const safeAccount = sanitizeAccountName(account);
    if (!safeAccount) {
      return NextResponse.json({ error: "Invalid account name" }, { status: 400 });
    }

    switch (action) {
      case "setMoney": {
        const amount = parseInt(value);
        if (isNaN(amount) || amount < 0 || amount > 999999999) {
          return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }
        const result = await sendServerCommand(`setmoney ${safeAccount} ${amount}`);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
        return NextResponse.json({ success: true, message: `Money set to $${amount.toLocaleString()} for ${safeAccount}` });
      }
      case "setLevel": {
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 999) {
          return NextResponse.json({ error: "Invalid level" }, { status: 400 });
        }
        const result = await sendServerCommand(`setlevel ${safeAccount} ${level}`);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
        return NextResponse.json({ success: true, message: `Level set to ${level} for ${safeAccount}` });
      }
      case "setSkin": {
        const skin = parseInt(value);
        if (isNaN(skin) || skin < 0 || skin > 312) {
          return NextResponse.json({ error: "Invalid skin ID" }, { status: 400 });
        }
        const result = await sendServerCommand(`setskin ${safeAccount} ${skin}`);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
        return NextResponse.json({ success: true, message: `Skin set to ${skin} for ${safeAccount}` });
      }
      case "setWanted": {
        const wanted = parseInt(value);
        if (isNaN(wanted) || wanted < 0 || wanted > 6) {
          return NextResponse.json({ error: "Invalid wanted level" }, { status: 400 });
        }
        const result = await sendServerCommand(`setwanted ${safeAccount} ${wanted}`);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
        return NextResponse.json({ success: true, message: `Wanted level set to ${wanted} for ${safeAccount}` });
      }
      case "kick": {
        const reason = typeof value === "string" && value.length > 0 ? value.slice(0, 100) : "Kicked by admin";
        const safeReason = reason.replace(/[^a-zA-Z0-9 .,!?\-]/g, "");
        const result = await sendServerCommand(`kick ${safeAccount} ${safeReason}`);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
        return NextResponse.json({ success: true, message: `Kicked ${safeAccount}` });
      }
      case "ban": {
        const reason = typeof value === "string" && value.length > 0 ? value.slice(0, 100) : "Banned by admin";
        const safeReason = reason.replace(/[^a-zA-Z0-9 .,!?\-]/g, "");
        const result = await sendServerCommand(`ban ${safeAccount} ${safeReason}`);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
        return NextResponse.json({ success: true, message: `Banned ${safeAccount}` });
      }
      case "giveMoney": {
        const amount = parseInt(value);
        if (isNaN(amount) || amount < 0 || amount > 999999999) {
          return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }
        const result = await sendServerCommand(`givecash ${safeAccount} ${amount}`);
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
        return NextResponse.json({ success: true, message: `Gave $${amount.toLocaleString()} to ${safeAccount}` });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

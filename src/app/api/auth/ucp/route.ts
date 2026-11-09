import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPlayerSession, PLAYER_SESSION_COOKIE_NAME, PLAYER_SESSION_MAX_AGE } from "@/lib/auth";
import { getMtaPlayer } from "@/lib/mtasa";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code format. Enter the 6-digit code from /ucp." }, { status: 400 });
    }

    const { verifyUcpCode } = await import("@/lib/ucp-codes");
    const accountName = await verifyUcpCode(code);

    if (!accountName) {
      return NextResponse.json({ error: "Invalid or expired code. Type /ucp again in-game." }, { status: 401 });
    }

    const player = await getMtaPlayer(accountName);
    if (!player) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const token = await createPlayerSession(accountName);
    const cookieStore = await cookies();
    cookieStore.set(PLAYER_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PLAYER_SESSION_MAX_AGE,
    });

    return NextResponse.json({ success: true, player });
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

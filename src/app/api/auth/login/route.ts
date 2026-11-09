import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { getStaffRoleByName } from "@/lib/mtasa";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, username } = body;

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const adminName = username || "Admin";
    const adminRole = getStaffRoleByName(adminName) || "Staff";

    const token = await createSessionToken(adminName, adminRole);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({ success: true, admin: { name: adminName, role: adminRole } });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

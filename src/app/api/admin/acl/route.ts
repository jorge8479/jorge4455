import { NextResponse } from "next/server";
import { getAllAclGroups, sanitizeAccountName, getStaffRoleByName, canManageAclGroup, updatePlayerAcl, logPermissionChange } from "@/lib/mtasa";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const groups = await getAllAclGroups();
    return NextResponse.json({ groups, admin: session });
  } catch {
    return NextResponse.json({ error: "Failed to load ACL groups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, account, group } = body;

    if (!action || !account || !group) {
      return NextResponse.json({ error: "Missing required fields: action, account, group" }, { status: 400 });
    }

    if (action !== "grant" && action !== "revoke") {
      return NextResponse.json({ error: "Invalid action. Must be 'grant' or 'revoke'" }, { status: 400 });
    }

    const safeAccount = sanitizeAccountName(account);
    if (!safeAccount) {
      return NextResponse.json({ error: "Invalid account name" }, { status: 400 });
    }

    const validGroups = [
      "AdminNighSide", "SuperModNighSide", "ModNighSide", "NightStaff",
      "NightPolicia", "Night911", "NightMecanico", "NightGang", "NightVIP",
    ];
    if (!validGroups.includes(group)) {
      return NextResponse.json({ error: "Invalid ACL group" }, { status: 400 });
    }

    const adminRole = session.role;
    if (!canManageAclGroup(adminRole, group)) {
      return NextResponse.json(
        { error: `Your role (${adminRole}) cannot manage ${group}` },
        { status: 403 }
      );
    }

    const aclValue = action === "grant" ? group : "";
    const result = await updatePlayerAcl(safeAccount, aclValue);

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Failed to update ACL" }, { status: 500 });
    }

    // Log the change
    await logPermissionChange(safeAccount, group, action, session.name);

    return NextResponse.json({
      success: true,
      message: action === "grant" ? `${group} granted to ${safeAccount}` : `${group} revoked from ${safeAccount}`,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

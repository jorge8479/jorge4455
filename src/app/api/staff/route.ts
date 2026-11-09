import { NextResponse } from "next/server";
import { getMtaStaff } from "@/lib/mtasa";

export async function GET() {
  const staff = await getMtaStaff();

  if (!staff) {
    return NextResponse.json({ staff: [] });
  }

  return NextResponse.json({ staff });
}

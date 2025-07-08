import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEarningsData } from "@/lib/db/earnings";

export async function GET() {
  try {
    const user = await auth();
    if (!user?.user?.airtableId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const earningsData = await getEarningsData(user.user.airtableId);
    return NextResponse.json(earningsData);
  } catch (err) {
    console.error("Error fetching earnings data:", err);
    return NextResponse.json({ error: "Failed to fetch earnings data" }, { status: 500 });
  }
} 
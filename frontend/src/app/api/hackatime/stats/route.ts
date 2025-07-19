import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserByRecordId } from "@/lib/db/user";
import { fetchHackatimeUserStats } from "@/lib/hackatime";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const dbUser = await getUserByRecordId(user.airtableId);
    if (!dbUser || !dbUser.slackId) {
      return NextResponse.json({ error: "Missing Slack ID." }, { status: 400 });
    }

    const stats = await fetchHackatimeUserStats(dbUser.slackId);
    
    if (!stats) {
      return NextResponse.json({ error: "Failed to fetch Hackatime stats." }, { status: 500 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching Hackatime stats:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
} 
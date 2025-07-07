import { NextRequest, NextResponse } from "next/server";
import { createSession, getUnfinishedSessionForUser } from "@/lib/db/airtable";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept project (record ID) and any other info needed
    if (!body.project) {
      return NextResponse.json({ error: "Missing project." }, { status: 400 });
    }
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    // Check for unfinished session
    const unfinished = await getUnfinishedSessionForUser(user.airtableId);
    if (unfinished) {
      return NextResponse.json({ error: "You already have an unfinished session.", unfinishedSession: unfinished }, { status: 400 });
    }
    const now = new Date().toISOString();
    const sessionData = {
      user: [user.airtableId],
      project: [body.project],
      startTime: now,
      endTime: "", // Not set yet
      gitCommitUrl: "", // Not set yet
      imageUrl: "", // Not set yet
    };
    const session = await createSession(sessionData);
    return NextResponse.json({ success: true, session });
  } catch (err) {
    return NextResponse.json({ error: "Failed to start session." }, { status: 500 });
  }
} 
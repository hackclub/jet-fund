import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/db/airtable";
import { getUser } from "@/lib/auth";
import { getAirtableUserBySlackId } from "@/lib/db/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept project (record ID) and any other info needed
    if (!body.project) {
      return NextResponse.json({ error: "Missing project." }, { status: 400 });
    }
    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const airtableUser = await getAirtableUserBySlackId(user.id);
    if (!airtableUser) {
      return NextResponse.json({ error: "Airtable user not found." }, { status: 404 });
    }
    const now = new Date().toISOString();
    const sessionData = {
      user: [airtableUser.id],
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
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/db/airtable";
import { getUser } from "@/lib/auth";
import { getAirtableUserBySlackId } from "@/lib/db/user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.sessionId || !body.gitCommitUrl || !body.imageUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
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
    const updated = await updateSession(body.sessionId, {
      endTime: now,
      gitCommitUrl: body.gitCommitUrl,
      imageUrl: body.imageUrl,
    });
    return NextResponse.json({ success: true, session: updated });
  } catch (err) {
    return NextResponse.json({ error: "Failed to finish session." }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { updateSession, getSessionByRecordId } from "@/lib/db/session";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.sessionId || !body.gitCommitUrl || !body.imageUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    
    // Check session ownership
    const session = await getSessionByRecordId(body.sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
    
    if (!session.user.includes(user.airtableId)) {
      return NextResponse.json({ error: "Not authorized to submit this session." }, { status: 403 });
    }
    
    // Check if session is already approved or rejected
    if (session.status === "approved" || session.status === "rejected") {
      return NextResponse.json({ error: "Session is already reviewed." }, { status: 400 });
    }
    
    // Only allow submitting details for finished sessions
    if (session.status !== "finished") {
      return NextResponse.json({ error: "Session must be finished before submitting details." }, { status: 400 });
    }
    
    const updated = await updateSession(body.sessionId, {
      ...session,
      gitCommitUrl: body.gitCommitUrl,
      imageUrl: body.imageUrl,
    });
    return NextResponse.json({ success: true, session: updated });
  } catch {
    return NextResponse.json({ error: "Failed to submit session." }, { status: 500 });
  }
} 
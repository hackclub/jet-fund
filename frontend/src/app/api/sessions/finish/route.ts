import { NextRequest, NextResponse } from "next/server";
import { updateSession, getSessionByRecordId } from "@/lib/db/session";
import { getUser } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
      return NextResponse.json({ error: "Not authorized to finish this session." }, { status: 403 });
    }
    
    const now = new Date().toISOString();
    
    // Session duration validation to prevent fraud
    const startTime = new Date(session.startTime);
    const endTime = new Date(now);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Prevent sessions longer than 24 hours
    if (durationHours > 24) {
      return NextResponse.json({ 
        error: "Session duration exceeds maximum allowed time of 24 hours." 
      }, { status: 400 });
    }
    
    // Prevent sessions with negative duration (end before start)
    if (durationHours < 0) {
      return NextResponse.json({ 
        error: "Invalid session duration: end time cannot be before start time." 
      }, { status: 400 });
    }
    
    // Prevent sessions shorter than 1 minute (likely accidental)
    if (durationHours < 1/60) {
      return NextResponse.json({ 
        error: "Session duration is too short. Minimum session time is 1 minute." 
      }, { status: 400 });
    }
    
    const updated = await updateSession(body.sessionId, {
      endTime: now,
      gitCommitUrl: body.gitCommitUrl,
      imageUrl: body.imageUrl,
    });
    return NextResponse.json({ success: true, session: updated });
  } catch {
    return NextResponse.json({ error: "Failed to finish session." }, { status: 500 });
  }
} 
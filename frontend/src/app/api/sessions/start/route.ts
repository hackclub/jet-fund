import { NextRequest, NextResponse } from "next/server";
import { createSession, getUnfinishedSessionForUser } from "@/lib/db/session";
import { getProjectByRecordId } from "@/lib/db/project";
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
    
    // Check if project is submitted (cannot log time to submitted projects)
    const project = await getProjectByRecordId(body.project);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    
    if (project.status === "finished") {
      return NextResponse.json({ error: "Cannot log time to a submitted project." }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: "Failed to start session." }, { status: 500 });
  }
} 
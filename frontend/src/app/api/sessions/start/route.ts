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
    
    // Check project ownership and status
    const project = await getProjectByRecordId(body.project);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    
    // Check ownership
    if (!project.user.includes(user.airtableId)) {
      return NextResponse.json({ error: "Not authorized to start session for this project." }, { status: 403 });
    }
    
    // Check if project is submitted/approved (cannot log time to non-active projects)
    if (project.status !== "active") {
      return NextResponse.json({ error: "Cannot log time to a submitted project." }, { status: 400 });
    }
    
    // Check for unfinished session
    const unfinished = await getUnfinishedSessionForUser(user.airtableId);
    if (unfinished) {
        // If the previous session is finished but missing commit URL or image, block new session
      if (
        unfinished.status === "finished" && 
        (!unfinished.gitCommitUrl || !unfinished.imageUrl)
      ) {
        return NextResponse.json({ 
          error: "You must submit a commit URL and screenshot for your last session before starting a new one.", 
          unfinishedSession: unfinished 
        }, { status: 400 });
      }
      // If the previous session is ongoing, block new session
      if (unfinished.status === "ongoing") {
        return NextResponse.json({ error: "You already have an ongoing session.", unfinishedSession: unfinished }, { status: 400 });
      }
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
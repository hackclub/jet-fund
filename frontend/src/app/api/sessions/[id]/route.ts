import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getSessionByRecordId, updateSession } from "@/lib/db/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    // Validate required fields
    if (!body.gitCommitUrl || !body.imageUrl) {
      return NextResponse.json({ error: "Missing required fields: gitCommitUrl, imageUrl" }, { status: 400 });
    }

    // Check session ownership
    const session = await getSessionByRecordId(id);
    if (!session || !session.user.includes(user.airtableId)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    // Only allow updating rejected sessions
    if (session.status !== "rejected") {
      return NextResponse.json({ error: "Can only update rejected sessions." }, { status: 400 });
    }

    // Update session with new details
    const updated = await updateSession(id, {
      ...session,
      status: "finished",
      gitCommitUrl: body.gitCommitUrl,
      imageUrl: body.imageUrl,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update session." }, { status: 500 });
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (err) {
    console.error("Error updating session:", err);
    return NextResponse.json({ error: "Failed to update session." }, { status: 500 });
  }
} 
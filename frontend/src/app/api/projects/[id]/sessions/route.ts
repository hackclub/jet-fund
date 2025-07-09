import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getProjectByRecordId } from "@/lib/db/project";
import { getSessionsByProjectId } from "@/lib/db/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Check project ownership
  const project = await getProjectByRecordId(id);
  if (!project || !project.user.includes(user.airtableId)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const sessions = await getSessionsByProjectId(id);
  return NextResponse.json({ sessions });
} 
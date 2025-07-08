import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getProjectByRecordId, updateProject, deleteProject } from "@/lib/db/project";
// import { getTotalTimeForProject } from "@/lib/db/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  // Only handle GET for project details here
  const project = await getProjectByRecordId(id);
  if (!project || !project.user.includes(user.airtableId)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Missing name." }, { status: 400 });
  
  const { id } = await params;
  
  // Check ownership
  const project = await getProjectByRecordId(id);
  if (!project || !project.user.includes(user.airtableId)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  
  const updated = await updateProject(id, { name: body.name });
  if (!updated) {
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
  
  return NextResponse.json({ project: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  
  const { id } = await params;
  
  // Check ownership
  const project = await getProjectByRecordId(id);
  if (!project || !project.user.includes(user.airtableId)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  
  // Prevent deletion of submitted projects
  if (project.status === "finished") {
    return NextResponse.json({ error: "Cannot delete a submitted project." }, { status: 400 });
  }
  
  const success = await deleteProject(id);
  if (!success) {
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
} 
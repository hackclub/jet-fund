import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getProjectsByUserId, createProject } from "@/lib/db/project";

export async function GET() {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  
  // Fetch projects using the new function
  const projects = await getProjectsByUserId(user.airtableId);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Missing name." }, { status: 400 });
  
  const project = await createProject({
    name: body.name,
    user: [user.airtableId],
    hackatimeProjectName: body.hackatimeProjectName
  });
  
  if (!project) {
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
  
  return NextResponse.json({ project });
} 
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getProjectByRecordId, updateProject } from "@/lib/db/project";
import { getUserByRecordId } from "@/lib/db/user";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    // Validate required fields
    if (!body.playableUrl || !body.codeUrl || !body.screenshotUrl || !body.description) {
      return NextResponse.json({ 
        error: "Missing required fields: playableUrl, codeUrl, screenshotUrl, description" 
      }, { status: 400 });
    }

    // Check project ownership and status
    const existingProject = await getProjectByRecordId(id);
    if (!existingProject || !existingProject.user.includes(user.airtableId)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    if (existingProject.status === "finished") {
      return NextResponse.json({ error: "Project is already submitted." }, { status: 400 });
    }

    // Check if user has address set
    const dbUser = await getUserByRecordId(user.airtableId);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!dbUser.addressLine1 || !dbUser.city || !dbUser.state || !dbUser.postalCode || !dbUser.country) {
      return NextResponse.json({ 
        error: "Address must be set in account settings before submitting a project." 
      }, { status: 400 });
    }

    // Update project with submission data
    const updatedProject = await updateProject(id, {
      status: "finished",
      playableUrl: body.playableUrl,
      codeUrl: body.codeUrl,
      screenshotUrl: body.screenshotUrl,
      description: body.description,
    });

    if (!updatedProject) {
      return NextResponse.json({ error: "Failed to submit project." }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (err) {
    console.error("Error submitting project:", err);
    return NextResponse.json({ error: "Failed to submit project." }, { status: 500 });
  }
} 
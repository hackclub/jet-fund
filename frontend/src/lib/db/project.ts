import { base, PROJECTS_TABLE } from "@/lib/db/airtable";
import type { FieldSet, Record as AirtableRecord } from "airtable";
import type { Project } from "@/lib/db/types";

// Helper to convert Airtable record to Project
function recordToProject(record: AirtableRecord<FieldSet>): Project {
  return {
    id: record.id,
    name: record.get('name') as string,
    user: record.get('user') as string[] || [],
    status: record.get('status') as "active" | "finished" || "active",
    totalHours: record.get('totalHours') as number || 0,
    sessions: record.get('sessions') as string[] || [],
    // Submission fields (only present when status is "finished")
    playableUrl: record.get('playableUrl') as string | undefined,
    codeUrl: record.get('codeUrl') as string | undefined,
    screenshotUrl: record.get('screenshotUrl') as string | undefined,
    description: record.get('description') as string | undefined,
  };
}

// Get a project by Airtable record ID
export async function getProjectByRecordId(id: string): Promise<Project | null> {
  try {
    const record = await base(PROJECTS_TABLE).find(id);
    return record ? recordToProject(record) : null;
  } catch (err) {
    console.error("Error fetching project by record ID:", err);
    return null;
  }
}

// Get projects by user ID (Airtable record ID)
export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  try {
    const records = await base(PROJECTS_TABLE).select({
      filterByFormula: `userId = '${userId}'`,
    }).all();
    return records.map(recordToProject);
  } catch (err) {
    console.error("Error fetching projects by user ID:", err);
    return [];
  }
}



// Create a new project
export async function createProject(data: {
  name: string;
  user: string[]; // Array of user record IDs
}): Promise<Project | null> {
  try {
    const created = await base(PROJECTS_TABLE).create([
      {
        fields: {
          name: data.name,
          user: data.user,
          status: "active",
          totalHours: 0,
        }
      }
    ]);
    return recordToProject(created[0]);
  } catch (err) {
    console.error("Error creating project:", err);
    return null;
  }
}

// Update a project
export async function updateProject(
  id: string,
  data: {
    name?: string;
    status?: "active" | "finished";
    playableUrl?: string;
    codeUrl?: string;
    screenshotUrl?: string;
    description?: string;
  }
): Promise<Project | null> {
  try {
    const updateFields: Record<string, any> = {};
    
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.status !== undefined) updateFields.status = data.status;
    if (data.playableUrl !== undefined) updateFields.playableUrl = data.playableUrl;
    if (data.codeUrl !== undefined) updateFields.codeUrl = data.codeUrl;
    if (data.screenshotUrl !== undefined) updateFields.screenshotUrl = data.screenshotUrl;
    if (data.description !== undefined) updateFields.description = data.description;

    const updated = await base(PROJECTS_TABLE).update([
      {
        id,
        fields: updateFields,
      }
    ]);
    
    return recordToProject(updated[0]);
  } catch (err) {
    console.error("Error updating project:", err);
    return null;
  }
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    await base(PROJECTS_TABLE).destroy([id]);
    return true;
  } catch (err) {
    console.error("Error deleting project:", err);
    return false;
  }
}

 
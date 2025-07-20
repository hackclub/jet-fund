import { base, PROJECTS_TABLE, AIRTABLE_VIEW } from "@/lib/db/airtable";
import type { FieldSet, Record as AirtableRecord } from "airtable";
import type { Project } from "@/lib/db/types";

// Helper to convert Airtable record to Project
function recordToProject(record: AirtableRecord<FieldSet>): Project {
  const status = record.get('status') as string;
  
  // Helper function to round numbers to 2 decimal places
  const roundToTwoDecimals = (value: number | undefined): number | undefined => {
    if (value === undefined || value === null) return undefined;
    return Math.round(value * 100) / 100;
  };
  
  return {
    id: record.id,
    name: record.get('name') as string,
    user: record.get('user') as string[] || [],
    status: (status === "submitted" || status === "approved" || status === "rejected") ? status : "active",
    sessions: record.get('sessions') as string[] || [],
    // Submission fields (only present when status is "submitted")
    playableUrl: record.get('playableUrl') as string | undefined,
    codeUrl: record.get('codeUrl') as string | undefined,
    screenshotUrl: record.get('screenshotUrl') as string | undefined,
    description: record.get('description') as string | undefined,
    // Hackatime integration
    hackatimeProjectName: record.get('hackatimeProjectName') as string | undefined,
    sessionPendingHours: roundToTwoDecimals(record.get('sessionPendingHours') as number | undefined),
    sessionApprovedHours: roundToTwoDecimals(record.get('sessionApprovedHours') as number | undefined),
    hackatimePendingHours: roundToTwoDecimals(record.get('hackatimePendingHours') as number | undefined),
    hackatimeApprovedHours: roundToTwoDecimals(record.get('hackatimeApprovedHours') as number | undefined),
    pendingHours: roundToTwoDecimals(record.get('pendingHours') as number | undefined),
    approvedHours: roundToTwoDecimals(record.get('approvedHours') as number | undefined),
    reviewJustification: record.get('reviewJustification') as string | undefined,
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
      view: AIRTABLE_VIEW,
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
  hackatimeProjectName?: string;
}): Promise<Project | null> {
  try {
    const created = await base(PROJECTS_TABLE).create([
      {
        fields: {
          name: data.name,
          user: data.user,
          status: "active",
          hackatimeProjectName: data.hackatimeProjectName || "",
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
    status?: "active" | "submitted" | "approved" | "rejected";
    playableUrl?: string;
    codeUrl?: string;
    screenshotUrl?: string;
    description?: string;
    hackatimeProjectName?: string;
  }
): Promise<Project | null> {
  try {
    const record = await base(PROJECTS_TABLE).update([
      {
        id,
        fields: {
          name: data.name || "",
          status: data.status || "active",
          playableUrl: data.playableUrl || "",
          codeUrl: data.codeUrl || "",
          screenshotUrl: data.screenshotUrl || "",
          description: data.description || "",
          hackatimeProjectName: data.hackatimeProjectName || "",
        },
      }
    ]);
    
    return recordToProject(record[0]);
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

 
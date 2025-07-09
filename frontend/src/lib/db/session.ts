import type { Session } from "./types";
import Airtable from "airtable";
import { SESSIONS_TABLE, base, AIRTABLE_VIEW } from "./airtable";

// Helper to convert Airtable record to Session
function recordToSession(record: Airtable.Record<Airtable.FieldSet>): Session {
  return {
    id: record.id,
    user: record.get("user") as string[],
    project: record.get("project") as string[],
    startTime: record.get("startTime") as string,
    endTime: record.get("endTime") as string,
    gitCommitUrl: record.get("gitCommitUrl") as string,
    imageUrl: record.get("imageUrl") as string,
    hoursSpent: record.get("hoursSpent") as number | undefined,
  };
}

// Get a session by Airtable record ID
export async function getSessionByRecordId(id: string): Promise<Session | null> {
  const record = await base(SESSIONS_TABLE).find(id);
  if (!record) {
    return null;
  }
  return recordToSession(record);
}

// Get unfinished session for a user
export async function getUnfinishedSessionForUser(userId: string): Promise<Session | null> {
  const records = await base(SESSIONS_TABLE).select({
    filterByFormula: `AND(userId = '${userId}', endTime = '')`,
    view: AIRTABLE_VIEW,
  }).all();
  if (records.length === 0) {
    return null;
  }
  return recordToSession(records[0]);
}

// Get all sessions for a project
export async function getSessionsByProjectId(projectId: string): Promise<Session[]> {
  const records = await base(SESSIONS_TABLE).select({
    filterByFormula: `projectId = '${projectId}'`,
    view: AIRTABLE_VIEW,
    sort: [{ field: 'startTime', direction: 'desc' }],
  }).all();
  return records.map(recordToSession);
}

// Create a new session
export async function createSession(data: {
  user: string[];
  project: string[];
  startTime: string;
  endTime?: string;
  gitCommitUrl?: string;
  imageUrl?: string;
}): Promise<Session | null> {
  try {
    const record = await base(SESSIONS_TABLE).create([
      {
        fields: {
          user: data.user,
          project: data.project,
          startTime: data.startTime,
          endTime: data.endTime || "",
          gitCommitUrl: data.gitCommitUrl || "",
          imageUrl: data.imageUrl || "",
        },
      },
    ]);
    return recordToSession(record[0]);
  } catch (err) {
    console.error("Error creating session:", err);
    return null;
  }
}

// Update a session
export async function updateSession(
  id: string,
  data: {
    endTime?: string;
    gitCommitUrl?: string;
    imageUrl?: string;
  }
): Promise<Session | null> {
  try {
    const record = await base(SESSIONS_TABLE).update(id, {
      endTime: data.endTime || "",
      gitCommitUrl: data.gitCommitUrl || "",
      imageUrl: data.imageUrl || "",
    });
    return recordToSession(record);
  } catch (err) {
    console.error("Error updating session:", err);
    return null;
  }
}

/**
 * Returns the total time (in hours) spent on a project by summing all finished sessions for a given projectId.
 * Uses the hoursSpent formula field from Airtable for accurate calculations.
 */
export async function getTotalTimeForProject(projectId: string): Promise<number> {
  const records = await base(SESSIONS_TABLE).select({
    filterByFormula: `AND(projectId = '${projectId}', NOT(endTime = ''))`,
    view: AIRTABLE_VIEW,
  }).all();
  
  let totalHours = 0;
  for (const record of records) {
    const session = recordToSession(record);
    if (session.hoursSpent) {
      totalHours += session.hoursSpent;
    }
  }
  
  return totalHours;
}


 
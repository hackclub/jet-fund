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
 * Returns the total time (in seconds) spent on a project by summing all finished sessions for a given projectId.
 */
export async function getTotalTimeForProject(projectId: string): Promise<number> {
  const records = await base(SESSIONS_TABLE).select({
    filterByFormula: `AND(projectId = '${projectId}', NOT(endTime = ''))`,
    view: AIRTABLE_VIEW,
  }).all();
  let totalSeconds = 0;
  for (const record of records) {
    const start = record.get('startTime');
    const end = record.get('endTime');
    if (start && end) {
      const startTime = new Date(start as string).getTime();
      const endTime = new Date(end as string).getTime();
      if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
        totalSeconds += Math.floor((endTime - startTime) / 1000);
      }
    }
  }
  return totalSeconds;
}


 
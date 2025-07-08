import { base, SESSIONS_TABLE, createSession as createSessionAirtable, updateSession as updateSessionAirtable, getUnfinishedSessionForUser as getUnfinishedSessionForUserAirtable, getSessionById } from "@/lib/db/airtable";
import type { FieldSet, Record as AirtableRecord } from "airtable";
import type { Session } from "@/lib/db/types";

// Helper to convert Airtable record to Session
function recordToSession(record: AirtableRecord<FieldSet>): Session {
  return {
    id: record.id,
    user: record.get('user') as string[] || [],
    project: record.get('project') as string[] || [],
    startTime: record.get('startTime') as string,
    endTime: record.get('endTime') as string || "",
    gitCommitUrl: record.get('gitCommitUrl') as string || "",
    imageUrl: record.get('imageUrl') as string || "",
  };
}

// Get a session by Airtable record ID
export async function getSessionByRecordId(id: string): Promise<Session | null> {
  return getSessionById(id);
}





// Get unfinished session for a user
export async function getUnfinishedSessionForUser(userId: string): Promise<Session | null> {
  return getUnfinishedSessionForUserAirtable(userId);
}

// Create a new session
export async function createSession(data: {
  user: string[]; // Array of user record IDs
  project: string[]; // Array of project record IDs
  startTime: string; // ISO string
  endTime?: string; // ISO string
  gitCommitUrl?: string;
  imageUrl?: string;
}): Promise<Session | null> {
  try {
    return await createSessionAirtable({
      ...data,
      endTime: data.endTime || "",
      gitCommitUrl: data.gitCommitUrl || "",
      imageUrl: data.imageUrl || "",
    });
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
    return await updateSessionAirtable(id, data);
  } catch (err) {
    console.error("Error updating session:", err);
    return null;
  }
}



 
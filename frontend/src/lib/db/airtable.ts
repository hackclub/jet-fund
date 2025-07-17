import Airtable from "airtable";

export const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export const USERS_TABLE = "Users";

export const SESSIONS_TABLE = "Sessions";

export const PROJECTS_TABLE = "Projects";

export const AIRTABLE_VIEW = "Grid view";

import type { Session } from "./types";

/**
 * Creates a new session in Airtable Sessions table.
 * @param session Partial session data (user, project, startTime, endTime, gitCommitUrl, imageUrl)
 * @returns The created Session record
 */
export async function createSession(session: Omit<Session, "id">): Promise<Session> {
  const created = await base(SESSIONS_TABLE).create([
    {
      fields: {
        user: session.user, // array of user record IDs
        project: session.project, // array of project record IDs
        startTime: session.startTime,
        endTime: session.endTime,
        gitCommitUrl: session.gitCommitUrl,
        imageUrl: session.imageUrl,
      },
    },
  ]);
  const record = created[0];
  return {
    id: record.id,
    user: record.get("user") as string[],
    project: record.get("project") as string[],
    startTime: record.get("startTime") as string,
    endTime: record.get("endTime") as string,
    gitCommitUrl: record.get("gitCommitUrl") as string,
    imageUrl: record.get("imageUrl") as string,
    status: (["finished", "approved", "rejected"].includes(record.get("status") as string)
      ? (record.get("status") as string)
      : "ongoing") as "ongoing" | "finished" | "approved" | "rejected",
  };
}



/**
 * Fetches the current unfinished session for a user (endTime is empty).
 */
export async function getUnfinishedSessionForUser(userId: string) {
  const records = await base(SESSIONS_TABLE).select({
    filterByFormula: `AND(userId = '${userId}', OR(endTime = '', NOT(endTime)))`,
    maxRecords: 1,
    view: AIRTABLE_VIEW,
  }).firstPage();
  if (records.length === 0) return null;
  const record = records[0];
  return {
    id: record.id,
    user: record.get('user') as string[],
    project: record.get('project') as string[],
    startTime: record.get('startTime') as string,
    endTime: record.get('endTime') as string,
    gitCommitUrl: record.get('gitCommitUrl') as string,
    imageUrl: record.get('imageUrl') as string,
  };
}

/**
 * Fetches a session by its ID from Airtable Sessions table.
 * @param sessionId The session record ID
 * @returns The Session record or null if not found
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  try {
    const record = await base(SESSIONS_TABLE).find(sessionId);
    return {
      id: record.id,
      user: record.get("user") as string[],
      project: record.get("project") as string[],
      startTime: record.get("startTime") as string,
      endTime: record.get("endTime") as string,
      gitCommitUrl: record.get("gitCommitUrl") as string,
      imageUrl: record.get("imageUrl") as string,
      status: (["finished", "approved", "rejected"].includes(record.get("status") as string)
        ? (record.get("status") as string)
        : "ongoing") as "ongoing" | "finished" | "approved" | "rejected",
    };
  } catch {
    return null;
  }
} 
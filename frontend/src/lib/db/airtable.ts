import Airtable from "airtable";

export const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export const USERS_TABLE = "Users";

export const SESSIONS_TABLE = "Sessions";

export const PROJECTS_TABLE = "Projects";

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
  };
}

/**
 * Updates a session in Airtable Sessions table by ID.
 * @param sessionId The session record ID
 * @param fields Fields to update (endTime, gitCommitUrl, imageUrl)
 * @returns The updated Session record
 */
export async function updateSession(sessionId: string, fields: Partial<Pick<Session, "endTime" | "gitCommitUrl" | "imageUrl">>): Promise<Session> {
  const updated = await base(SESSIONS_TABLE).update([
    {
      id: sessionId,
      fields,
    },
  ]);
  const record = updated[0];
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
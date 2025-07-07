import { base, USERS_TABLE } from "@/lib/db/airtable";
import type { FieldSet, Record as AirtableRecord } from "airtable";

export interface User {
  id: string; // Airtable record ID
  slackId: string;
}

function airtableRecordToUser(record: AirtableRecord<FieldSet>): User {
  return {
    id: record.id,
    slackId: record.get('slackId') as string,
  };
}

/**
 * Looks up a user in Airtable by Slack ID. Returns the User object if found, or null if not found.
 */
export async function getAirtableUserBySlackId(slackId: string): Promise<User | null> {
  let records = await base(USERS_TABLE).select({
    filterByFormula: `slackId = '${slackId}'`,
    maxRecords: 1,
  }).firstPage();
  if (records.length > 0) return airtableRecordToUser(records[0]);
  return null;
}

/**
 * Looks up a user in Airtable by Slack ID. If not found, creates a new user row.
 * Returns the User object.
 */
export async function findOrCreateAirtableUser({ slackId }: { slackId: string }): Promise<User> {
  // Try to find by Slack ID
  const found = await getAirtableUserBySlackId(slackId);
  if (found) return found;

  // Create new user if not found
  const created = await base(USERS_TABLE).create([
    { fields: { slackId } },
  ]);
  return airtableRecordToUser(created[0]);
} 
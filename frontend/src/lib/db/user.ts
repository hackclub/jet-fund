import { base, USERS_TABLE } from "@/lib/db/airtable";
import type { FieldSet, Record as AirtableRecord } from "airtable";
import type { User } from "@/lib/db/types";

// UserSanitized: all non-address fields
export type UserSanitized = Omit<User, 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'postalCode' | 'country'>;

// Helper to convert Airtable record to User
function recordToUser(record: AirtableRecord<FieldSet>): User {
  return {
    id: record.id,
    slackId: record.get('slackId') as string,
    name: record.get('name') as string,
    email: record.get('email') as string,
    firstName: record.get('firstName') as string | undefined,
    lastName: record.get('lastName') as string | undefined,
    birthday: record.get('birthday') as string | undefined,
    addressLine1: record.get('addressLine1') as string | undefined,
    addressLine2: record.get('addressLine2') as string | undefined,
    city: record.get('city') as string | undefined,
    state: record.get('state') as string | undefined,
    postalCode: record.get('postalCode') as string | undefined,
    country: record.get('country') as string | undefined,
    projects: record.get('projects') as string[] || [],
    sessions: record.get('sessions') as string[] || [],
  };
}

// 1. getUserByRecordId -> User
export async function getUserByRecordId(id: string): Promise<User | null> {
  try {
    const record = await base(USERS_TABLE).find(id);
    return record ? recordToUser(record) : null;
  } catch (err) {
    console.error("Error fetching user by record ID:", err);
    return null;
  }
}

// 2. getUserBySlackId -> User
export async function getUserBySlackId(slackId: string): Promise<User | null> {
  try {
    const records = await base(USERS_TABLE).select({
      filterByFormula: `slackId = '${slackId}'`,
      maxRecords: 1,
    }).firstPage();
    return records.length > 0 ? recordToUser(records[0]) : null;
  } catch (err) {
    console.error("Error fetching user by Slack ID:", err);
    return null;
  }
}

// 3. sanitizeUser -> UserSanitized
export function sanitizeUser(user: User): UserSanitized {
  // Explicitly pick only non-address fields for security
  return {
    id: user.id,
    slackId: user.slackId,
    name: user.name,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    birthday: user.birthday,
    projects: user.projects,
    sessions: user.sessions,
  };
}

/**
 * Looks up a user in Airtable by Slack ID. If not found, creates a new user row.
 * Returns the User object.
 */
export async function ensureUser({ slackId }: { slackId: string }): Promise<User> {
  // Try to find by Slack ID
  const found = await getUserBySlackId(slackId);
  if (found) return found;

  // Create new user if not found
  const created = await base(USERS_TABLE).create([
    { fields: { slackId } },
  ]);
  const user = recordToUser(created[0]);
  return user;
}

/**
 * Updates a user profile in Airtable.
 * Returns the updated profile or null if failed.
 */
export async function updateUserProfile(
  id: string, 
  data: {
    personalInfo: {
      email: string;
      firstName: string;
      lastName: string;
      birthday?: string;
    };
    addressInfo?: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
  }
): Promise<User | null> {
  try {
    const updateFields: Record<string, string> = {
      email: data.personalInfo.email,
      firstName: data.personalInfo.firstName,
      lastName: data.personalInfo.lastName,
    };

    if (data.personalInfo.birthday) {
      updateFields.birthday = data.personalInfo.birthday;
    }

    // Only update address fields if provided
    if (data.addressInfo) {
      updateFields.addressLine1 = data.addressInfo.addressLine1;
      updateFields.city = data.addressInfo.city;
      updateFields.state = data.addressInfo.state;
      updateFields.postalCode = data.addressInfo.postalCode;
      updateFields.country = data.addressInfo.country;
      
      // Optional address line 2
      if (data.addressInfo.addressLine2) {
        updateFields.addressLine2 = data.addressInfo.addressLine2;
      }
    }

    const updated = await base(USERS_TABLE).update([
      {
        id,
        fields: updateFields,
      },
    ]);

    const record = updated[0];
    return recordToUser(record);
  } catch (err) {
    console.error("Error updating user profile:", err);
    return null;
  }
} 
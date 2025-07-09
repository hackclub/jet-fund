export interface User {
  id: string; // Airtable record ID
  slackId: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  spentUsd?: number; // Amount spent by the user
  // Address fields are stored but never returned to client for security
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  projects: string[]; // Linked Project record IDs
  sessions: string[]; // Linked Session record IDs
  sessionsInvalidatedAt?: string; // ISO timestamp for session invalidation
}

export interface Project {
  id: string;
  name: string;
  user: string[]; // Linked User record IDs (usually length 1)
  status: "active" | "submitted" | "approved" | "rejected";
  sessions: string[]; // Linked Session record IDs
  // Readonly field for Airtable formula search - userId (from user field)
  // readonly userId: string; // Extracted from user[0] for search purposes
  // Submission fields (only present when status is "submitted")
  playableUrl?: string;
  codeUrl?: string;
  screenshotUrl?: string;
  description?: string;
  readonly pendingHours?: number; // Rollup of session hoursSpent where session.status !== "approved"
  readonly approvedHours?: number; // Rollup of session hoursSpent where session.status === "approved"
  readonly rejectionReason?: string; // Set by reviewers in Airtable when status is "rejected"
}

export interface Session {
  id: string;
  user: string[]; // Linked User record IDs (usually length 1)
  project: string[]; // Linked Project record IDs (usually length 1)
  startTime: string; // ISO string
  endTime: string;   // ISO string
  gitCommitUrl: string;
  imageUrl: string; // Airtable attachment URL
  status: "ongoing" | "finished" | "approved" | "rejected";
  // Readonly fields for Airtable formula search
  // readonly userId: string; // Extracted from user[0] for search purposes
  // readonly projectId: string; // Extracted from project[0] for search purposes
  readonly hoursSpent?: number; // Calculated by Airtable formula: ROUND(DATETIME_DIFF({endTime}, {startTime}, 'seconds') / 3600, 2)
  readonly rejectionReason?: string; // Set by reviewers in Airtable when status is "rejected"
} 
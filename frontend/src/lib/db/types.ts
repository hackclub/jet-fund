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
}

export interface Project {
  id: string;
  name: string;
  user: string[]; // Linked User record IDs (usually length 1)
  status: "active" | "finished" | "approved";
  sessions: string[]; // Linked Session record IDs
  // Readonly field for Airtable formula search - userId (from user field)
  // readonly userId: string; // Extracted from user[0] for search purposes
  // Submission fields (only present when status is "finished")
  playableUrl?: string;
  codeUrl?: string;
  screenshotUrl?: string;
  description?: string;
}

export interface Session {
  id: string;
  user: string[]; // Linked User record IDs (usually length 1)
  project: string[]; // Linked Project record IDs (usually length 1)
  startTime: string; // ISO string
  endTime: string;   // ISO string
  gitCommitUrl: string;
  imageUrl: string; // Airtable attachment URL
  // Readonly fields for Airtable formula search
  // readonly userId: string; // Extracted from user[0] for search purposes
  // readonly projectId: string; // Extracted from project[0] for search purposes
} 
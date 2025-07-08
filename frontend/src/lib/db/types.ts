export interface User {
  id: string; // Airtable record ID
  slackId: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
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
  status: "active" | "finished";
  totalHours: number;
  sessions: string[]; // Linked Session record IDs
}

export interface Session {
  id: string;
  user: string[]; // Linked User record IDs (usually length 1)
  project: string[]; // Linked Project record IDs (usually length 1)
  startTime: string; // ISO string
  endTime: string;   // ISO string
  gitCommitUrl: string;
  imageUrl: string; // Airtable attachment URL
} 
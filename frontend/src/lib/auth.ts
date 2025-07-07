// ---
// NextAuth Authentication Configuration
//
// - The JWT (JSON Web Token) is stored in a cookie on the client (browser) when using the default session strategy ("jwt").
//   It contains user/session data and is signed for security. The JWT is never sent to the client directly, but is used by the server to validate sessions.
// - The session is the object returned by NextAuth's `auth()` or `useSession()` hooks. It is sent to the client and contains safe user info (like name, email, id, and any custom fields you add in the session callback).
// - The Slack OAuth provider returns a profile object and tokens. You can see the exact structure of the Slack profile by logging the `profile` argument in the `profile` callback, or by checking Slack's API docs: https://api.slack.com/methods/users.info
// ---

import NextAuth from "next-auth"
import Slack from "next-auth/providers/slack"
import { findOrCreateAirtableUser } from "@/lib/db/user"

// --- Type augmentation to add accessToken to the Session type ---
import type { Session } from "next-auth"
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string; // Slack ID
      airtableId: string; // Airtable record ID
      name?: string;
      email?: string;
    }
  }
}

// NextAuth uses 'callbacks' to let you control what is saved in the JWT and session
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Slack({}),
  ],
  callbacks: {
    // 'jwt' callback runs whenever a JWT is created or updated
    async jwt({ token, account, profile }) {
      // If this is the initial sign-in, persist the Slack access token and id in the JWT
      if (account && profile) {
        token.accessToken = account.access_token;
        token.sub = profile.sub!;
        // Ensure Airtable user exists and load into token
        try {
          const user = await findOrCreateAirtableUser({ slackId: profile.sub! });
          token.airtableId = user.id;
        } catch (err) {
          console.error("Airtable user ensure error (jwt):", err);
        }
        console.log("JWT token:", token)
      }
      return token;
    },
    async session({ session, token }) {
      // 'session' callback runs whenever a session is checked or created
      // The session is the object returned to the client (browser) via auth() or useSession()
      // 'session' is what will be returned to the client, 'token' is the JWT
      session.accessToken = token.accessToken as string | undefined;
      session.user.id = token.sub as string;
      session.user.airtableId = token.airtableId as string;
      return session;
    },
  },
})

// Helper to get the current user IDs from the session
export async function getUser() {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id, // Slack ID
    airtableId: session.user.airtableId, // Airtable record ID
  };
}
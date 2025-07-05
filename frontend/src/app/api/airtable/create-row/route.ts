import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);
const TABLE_NAME = "Users"

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const email = session.user.email;
  // Slack user ID is now available on session.user.id
  const slackId = session.user.id;
  console.log(session)
  // This doesn't work because the id needs to be retrieved from the slack api using the email
  try {
    await base(TABLE_NAME).create([
      { fields: { slackId: slackId, email: email } },
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Airtable error", details: (error as Error).message }, { status: 500 });
  }
} 
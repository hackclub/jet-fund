import { NextResponse } from "next/server";
import { getUnfinishedSessionForUser } from "@/lib/db/session";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await  getUser();
  if (!user || !user.airtableId) return NextResponse.json({ session: null });
  const unfinished = await getUnfinishedSessionForUser(user.airtableId);
  return NextResponse.json({ session: unfinished });
} 
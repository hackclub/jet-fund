import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { invalidateUserSessions } from "@/lib/db/user";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Invalidate all sessions for this user (signs out on all devices)
    const updated = await invalidateUserSessions(user.airtableId);
    if (!updated) {
      return NextResponse.json({ error: "Failed to invalidate sessions." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Signed out on all devices successfully" 
    });
  } catch (err) {
    console.error("Error invalidating sessions:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
} 
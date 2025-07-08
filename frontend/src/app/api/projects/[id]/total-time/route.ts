import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getTotalTimeForProject } from "@/lib/db/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const totalSeconds = await getTotalTimeForProject(id);
  // Round to 2 decimal places
  const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;
  return NextResponse.json({ totalSeconds, totalHours });
} 
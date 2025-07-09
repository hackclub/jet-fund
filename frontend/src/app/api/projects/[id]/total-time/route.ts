import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getTotalTimeForProject } from "@/lib/db/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const totalHours = await getTotalTimeForProject(id);
  return NextResponse.json({ totalHours });
} 
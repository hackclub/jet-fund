import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { base, PROJECTS_TABLE } from "@/lib/db/airtable";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Missing name." }, { status: 400 });
  
  const { id } = await params;
  // Check ownership
  const record = await base(PROJECTS_TABLE).find(id);
  if (!record || !(record.get("user") as string[]).includes(user.airtableId)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const updated = await base(PROJECTS_TABLE).update([{ id, fields: { name: body.name } }]);
  const project = { id: updated[0].id, name: updated[0].get("name") as string };
  return NextResponse.json({ project });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  
  const { id } = await params;
  // Check ownership
  const record = await base(PROJECTS_TABLE).find(id);
  if (!record || !(record.get("user") as string[]).includes(user.airtableId)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  await base(PROJECTS_TABLE).destroy([id]);
  return NextResponse.json({ success: true });
} 
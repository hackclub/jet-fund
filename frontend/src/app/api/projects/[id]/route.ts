import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getAirtableUserBySlackId } from "@/lib/db/user";
import { base, PROJECTS_TABLE } from "@/lib/db/airtable";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user || !user.id) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const airtableUser = await getAirtableUserBySlackId(user.id);
  if (!airtableUser) return NextResponse.json({ error: "Airtable user not found." }, { status: 404 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Missing name." }, { status: 400 });
  // Check ownership
  const record = await base(PROJECTS_TABLE).find(params.id);
  if (!record || !(record.get("user") as string[]).includes(airtableUser.id)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const updated = await base(PROJECTS_TABLE).update([{ id: params.id, fields: { name: body.name } }]);
  const project = { id: updated[0].id, name: updated[0].get("name") as string };
  return NextResponse.json({ project });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user || !user.id) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const airtableUser = await getAirtableUserBySlackId(user.id);
  if (!airtableUser) return NextResponse.json({ error: "Airtable user not found." }, { status: 404 });
  // Check ownership
  const record = await base(PROJECTS_TABLE).find(params.id);
  if (!record || !(record.get("user") as string[]).includes(airtableUser.id)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  await base(PROJECTS_TABLE).destroy([params.id]);
  return NextResponse.json({ success: true });
} 
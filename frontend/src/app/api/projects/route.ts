import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getAirtableUserBySlackId } from "@/lib/db/user";
import { base, PROJECTS_TABLE } from "@/lib/db/airtable";

export async function GET() {
  const user = await getUser();
  if (!user || !user.id) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const airtableUser = await getAirtableUserBySlackId(user.id);
  if (!airtableUser) return NextResponse.json({ error: "Airtable user not found." }, { status: 404 });
  const records = await base(PROJECTS_TABLE).select({
    filterByFormula: `user = '${airtableUser.id}'`,
    view: "Grid view",
  }).all();
  const projects = records.map(r => ({ id: r.id, name: r.get("name") as string }));
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || !user.id) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const airtableUser = await getAirtableUserBySlackId(user.id);
  if (!airtableUser) return NextResponse.json({ error: "Airtable user not found." }, { status: 404 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Missing name." }, { status: 400 });
  const created = await base(PROJECTS_TABLE).create([{ fields: { name: body.name, user: [airtableUser.id] } }]);
  const project = { id: created[0].id, name: created[0].get("name") as string };
  return NextResponse.json({ project });
} 
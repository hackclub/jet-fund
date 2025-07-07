import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { base, PROJECTS_TABLE } from "@/lib/db/airtable";
import { getAirtableUserById } from "@/lib/db/user";

// Helper to fetch projects by array of IDs
async function getProjectsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  const records = await Promise.all(ids.map(id => base(PROJECTS_TABLE).find(id)));
  return records.map(r => ({ id: r.id, name: r.get("name") as string }));
}

export async function GET() {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const fullUser = await getAirtableUserById(user.airtableId);
  if (!fullUser || !fullUser.projects) return NextResponse.json({ projects: [] });
  const projects = await getProjectsByIds(fullUser.projects);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || !user.airtableId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Missing name." }, { status: 400 });
  const created = await base(PROJECTS_TABLE).create([{ fields: { name: body.name, user: [user.airtableId] } }]);
  const project = { id: created[0].id, name: created[0].get("name") as string };
  return NextResponse.json({ project });
} 
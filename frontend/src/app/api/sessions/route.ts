import { NextResponse } from "next/server";
import { getUnfinishedSessionForUser } from "@/lib/db/session";
import { getUser } from "@/lib/auth";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     // Basic validation (expand as needed)
//     if (!body.project || !body.startTime || !body.endTime || !body.gitCommitUrl || !body.imageUrl) {
//       return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
//     }
//     // For now, fake user/project IDs as arrays (replace with real logic)
//     const sessionData = {
//       user: ["recFakeUserId"], // TODO: Replace with real user record ID
//       project: [body.project], // Accept project as record ID for now
//       startTime: body.startTime,
//       endTime: body.endTime,
//       gitCommitUrl: body.gitCommitUrl,
//       imageUrl: body.imageUrl,
//     };
//     const session = await createSession(sessionData);
//     return NextResponse.json({ success: true, session });
//   } catch (err) {
//     return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
//   }
// }

export async function GET() {
  const user = await  getUser();
  if (!user || !user.airtableId) return NextResponse.json({ session: null });
  const unfinished = await getUnfinishedSessionForUser(user.airtableId);
  return NextResponse.json({ session: unfinished });
} 
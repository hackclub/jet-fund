import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { updateUserProfile, getUserByRecordId, sanitizeUser } from "@/lib/db/user";

export async function GET() {
  try {
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const dbUser = await getUserByRecordId(user.airtableId);
    if (!dbUser) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    // Only return sanitized (non-address) information
    return NextResponse.json(sanitizeUser(dbUser));
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user || !user.airtableId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await req.json();
    const { personalInfo, addressInfo } = body;

    if (!personalInfo) {
      return NextResponse.json({ error: "Personal information is required." }, { status: 400 });
    }

    // Validate personal information
    if (!personalInfo.email || !personalInfo.firstName || !personalInfo.lastName) {
      return NextResponse.json({ 
        error: "Email, first name, and last name are required." 
      }, { status: 400 });
    }

    // Update the user profile
    const updated = await updateUserProfile(user.airtableId, {
      personalInfo,
      addressInfo: addressInfo || null, // Address info is optional
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    // Return success without any address data
    return NextResponse.json({ 
      success: true,
      message: "Profile updated successfully"
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
} 
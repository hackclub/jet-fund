import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Step 1: Upload to Bucky
    const buckyFormData = new FormData();
    buckyFormData.append("file", file);
    
    const buckyResponse = await fetch("https://bucky.hackclub.com/", {
      method: "POST",
      body: buckyFormData,
    });
    const buckyUrl = await buckyResponse.text();
    console.log(buckyUrl);
    if (!buckyResponse.ok) {
      return NextResponse.json(
        { error: "Bucky upload failed" },
        { status: buckyResponse.status }
      );
    }


    // Step 2: Upload to Hack Club CDN
    const cdnResponse = await fetch("https://cdn.hackclub.com/api/v3/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer beans",
      },
      body: JSON.stringify([buckyUrl]),
    });

    if (!cdnResponse.ok) {
      console.log(`CDN upload failed: ${await cdnResponse.text()} | Bucky URL: ${buckyUrl}`);
      // todo: if there are parentheses in the filename it becomes something like this and fails:  https://imgutil.s3.us-east-2.amazonaws.com/5df74db86e0ca8f43f9eebbf533ad4fcba8437266fb01e43aab71c3249c02e27/RowanToldMeToSubmitAPictureOfACat%281%!j(MISSING)pg
      return NextResponse.json(
        { error: "CDN upload failed" },
        { status: cdnResponse.status }
      );
    }

    const cdnData = await cdnResponse.json();
    const finalUrl = cdnData.files[0].deployedUrl;

    return NextResponse.json({ url: finalUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
} 
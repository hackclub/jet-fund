import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://hackathons.hackclub.com/api/events/upcoming');
  const data = await res.json();
  return NextResponse.json(data);
} 
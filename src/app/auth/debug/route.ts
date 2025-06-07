import { NextRequest, NextResponse } from 'next/server'

// This route handler will block access to the debug page
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/auth/sign-in', request.url));
} 
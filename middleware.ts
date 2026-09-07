/**
 * middleware.ts — GATE COMPLETELY DISABLED
 * All traffic allowed. Everyone sees login page.
 */
import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

export function middleware(req: NextRequest) {
  return NextResponse.next()
}

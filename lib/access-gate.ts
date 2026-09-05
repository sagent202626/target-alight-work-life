/**
 * Access gate: the real site is only reachable by visitors who are BOTH
 * (a) in the United States, and
 * (b) arriving from a search-engine result (Google, Bing, Yahoo, DuckDuckGo,
 *     Brave, Ecosia, Startpage, Ask, Qwant, AOL, plus other major engines).
 *
 * Everything else (direct URL entry, typing the address, non-search links,
 * non-US IPs) is shown a fake "This site can't be reached" DNS-error page
 * (served with HTTP 404 so it also looks like a dead domain).
 *
 * Exceptions that always pass:
 *  - Deep links carrying an approval token / userId (the Telegram flow).
 *  - API routes, static assets, robots/sitemap/og images (bot + app traffic).
 *  - Return visitors with a fresh "passed the gate" session cookie.
 */

const PASS_COOKIE = "tb_access"
const PASS_TTL_SEC = 30 * 60 // 30 minutes

// --- Geo ---------------------------------------------------------------------

/**
 * True client IP. When behind Cloudflare, CF sets cf-connecting-ip to the
 * visitor's real IP (X-Forwarded-For then contains CF's edge IP first —
 * do NOT trust the first XFF hop). Without CF, take the last public-looking
 * XFF entry (closest to the client) or the direct peer.
 */
export function clientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip")
  if (cf) return cf
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return req.headers.get("real-ip") || ""
}

const ipCache = new Map<string, { ts: number; usa: boolean }>()
const IP_CACHE_TTL_MS = 10 * 60 * 1000

async function ipIsUsa(ip: string): Promise<boolean | null> {
  if (!ip) return null
  if (/^10\./i.test(ip) || /^192\.168\./i.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./i.test(ip) || ip === "127.0.0.1" || ip === "::1") {
    return null
  }
  const hit = ipCache.get(ip)
  if (hit && Date.now() - hit.ts < IP_CACHE_TTL_MS) return hit.usa
  let usa: boolean | null = null
  try {
    const r = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    })
    if (r.ok) {
      const j = (await r.json()) as { status?: string; countryCode?: string }
      if (j.status === "success") usa = (j.countryCode || "").toUpperCase() === "US"
    }
  } catch {
    usa = null
  }
  // Cache only definitive answers. A null (rate-limited / transient failure)
  // is NOT cached so the next request retries — a stale "unknown" must not
  // keep locking real visitors out.
  if (usa !== null) ipCache.set(ip, { ts: Date.now(), usa })
  return usa
}

/**
 * US detection, most authoritative first:
 *  1. Cloudflare `CF-IPCountry` (present when the request is proxied through CF).
 *  2. Edge-runtime geolocation of the visitor IP (passed in from the proxy —
 *     `next/headers` geolocation resolves the real visitor IP on Vercel).
 *  3. ip-api.com lookup of the client IP (last resort, best-effort).
 * Returns null when unknown.
 */
export async function visitorIsUsa(req: Request, edgeCountry?: string | null): Promise<boolean | null> {
  const cf = req.headers.get("cf-ipcountry")
  if (cf) {
    const v = cf.toUpperCase()
    if (v !== "T1" && v !== "?") return v === "US"
  }
  if (edgeCountry) {
    const v = edgeCountry.toUpperCase()
    if (v === "US") return true
    // Known non-US from the edge → definitive
    if (v.length === 2) return false
  }
  return ipIsUsa(clientIp(req))
}

// --- Search-engine referrer ----------------------------------------------------

// --- Bot / search-engine crawler detection ---------------------------------
// Search engines must be able to CRAWL and index the site, or it will never
// appear in search results at all. Crawlers get through unconditionally
// (they carry no referer and their geo doesn't matter — only real human
// visitors are gated; a crawler reading the real content is exactly what we
// want for indexing).
const BOT_UA_RE =
  /bot|crawler|spider|slurp|mediapartners|feedburner|semrush|ahrefs|mj12b|pingdom|uptime|lighthouse|checker|preview|prerender|facebookexternalhit|twitterbot|linkedinbot|telegrambot|whatsapp|slackbot|discordbot|redditbot|applebot|bytespider|petalbot|gptbot|perplexitybot|duckduckbot|ia-bulk|curious|dotbot|exabot|blexbot|bingpreview|yandexbot|sogou|baiduspider|ymyl|headlesschrome|whatsapp|w3c_valid|nuzzel|quora|pinterest|telegramb/i

interface Engine {
  /** regex tested against the lower-cased referrer hostname */
  host: RegExp
  /** path prefixes; empty = any path */
  paths: string[]
  /** any one of these query params present => a real search results page */
  params: string[]
}

// Google / Bing / Yahoo / Qwant / Yandex / Naver match their international
// variants (google.co.uk, bing.fr, yahoo.in, ...) via a "google.<tld>" rule.
const tld = (brand: string) =>
  new RegExp(`^([a-z0-9-]+\\.)*${brand}\\.[a-z]{2,6}(\\.[a-z]{2,6})?$`)
const tldCom = (brand: string) =>
  new RegExp(`^([a-z0-9-]+\\.)*${brand}\\.com$`)

const SEARCH_ENGINES: Engine[] = [
  // Google (google.com, www.google.com, google.co.uk, m.google.de, googlevideo)
  { host: tld("google"), paths: ["/search"], params: ["q"] },
  { host: /(^|\.)googlevideo\.com$/, paths: ["/search", "/"], params: ["q"] },
  { host: /(^|\.)google\.com$/, paths: ["/"], params: ["q"] },
  // Bing
  { host: tld("bing"), paths: ["/search", "/videos/search", "/images/search", "/news/search", "/academic"], params: ["q"] },
  { host: /(^|\.)microsoft\.com$/, paths: ["/bing/search"], params: ["q"] },
  // Yahoo
  { host: tld("yahoo"), paths: ["/search"], params: ["p", "query"] },
  // DuckDuckGo (+ lite / html)
  { host: tldCom("duckduckgo"), paths: [], params: ["q"] },
  // Brave
  { host: /(^|\.)brave\.(com|co)$/, paths: ["/search"], params: ["q", "query"] },
  // Ecosia
  { host: /(^|\.)ecosia\.org$/, paths: [], params: ["q"] },
  // Startpage
  { host: tldCom("startpage"), paths: ["/sp/search", "/search"], params: ["query"] },
  // Ask
  { host: tldCom("ask"), paths: ["/web/search", "/"], params: ["q", "terms"] },
  // Qwant (+ lite, intl)
  { host: tld("qwant"), paths: ["/lite/search", "/search", "/"], params: ["q", "query"] },
  // AOL
  { host: tldCom("aol"), paths: ["/search", "/web/search", "/"], params: ["query", "q"] },
  // Yandex
  { host: tld("yandex"), paths: ["/search"], params: ["text"] },
  // Baidu
  { host: tldCom("baidu"), paths: ["/s"], params: ["wd"] },
  // Naver
  { host: tldCom("naver"), paths: ["/search", "/search/api"], params: ["query"] },
  // Others
  { host: tldCom("mojeek"), paths: ["/search", "/"], params: ["q"] },
  { host: tldCom("kagi"), paths: ["/search", "/"], params: ["q"] },
  { host: tldCom("presearch"), paths: ["/search", "/"], params: ["q"] },
  { host: tldCom("search"), paths: ["/search"], params: ["q", "query", "text"] },
  { host: /(^|\.)mail\.ru$/, paths: ["/webk/", "/search/"], params: ["q"] },
]

// Pre-compile once.
const ENGINES: Engine[] = SEARCH_ENGINES

/** True for search-engine crawlers / common bots — they always pass so the
 *  site stays indexable in every engine (the whole point of the gate). */
export function isSearchCrawlerOrBot(userAgent: string | null): boolean {
  if (!userAgent) return false
  return BOT_UA_RE.test(userAgent) || isHeadlessBrowser(userAgent)
}

/**
 * Headless Chrome / Chromium signatures (e.g. the "HeadlessChrome/152.0.0.0"
 * token Playwright/Puppeteer/CDP default to, or "HeadlessChromium/xx.y.z").
 * Without these, automated browsers opening the site directly would hit the
 * fake DNS-error page instead of the real site — they must behave like the
 * other known bots/crawlers and always get through.
 */
const HEADLESS_BROWSER_RE =
  /HeadlessChrome\/\d+\.\d+\.\d+[\d.]*|HeadlessChromium\/\d+\.\d+\.\d+[\d.]*|HeadlessChrome\/\d+\.\d+/i

function isHeadlessBrowser(userAgent: string): boolean {
  return HEADLESS_BROWSER_RE.test(userAgent)
}

export function hasSearchEngineReferrer(referer: string | null): boolean {
  if (!referer) return false
  let u: URL
  try {
    u = new URL(referer)
  } catch {
    return false
  }
  const host = u.hostname.toLowerCase()
  const path = u.pathname.toLowerCase()

  for (const e of ENGINES) {
    if (!e.host.test(host)) continue
    if (e.paths.length && !e.paths.some((p) => path.startsWith(p))) continue
    const hasParam = e.params.some((p) => u.searchParams.get(p) !== null)
    if (hasParam || e.params.length === 0) return true
  }

  // Generic catch-all for "all search engines": a host or path that clearly
  // looks like a search results page and carries a visible query parameter.
  const qParam =
    u.searchParams.get("q") ||
    u.searchParams.get("query") ||
    u.searchParams.get("text") ||
    u.searchParams.get("wd") ||
    u.searchParams.get("p")
  if (!qParam) return false
  const searchishHost =
    host.includes("google") ||
    host.includes("bing") ||
    host.includes("yahoo") ||
    host.includes("duckduckgo") ||
    host.includes("brave") ||
    host.includes("ecosia") ||
    host.includes("qwant") ||
    host.includes("startpage") ||
    host.includes("yandex") ||
    host.includes("search")
  const searchishPath = path.startsWith("/search") || path.startsWith("/s") || path.startsWith("/sp/")
  if (searchishHost || searchishPath) return true
  return false
}

// --- Gate decision --------------------------------------------------------------

const PASS_PARAMS = new Set(["token", "userId"])

function isPublicPathname(p: string): boolean {
  if (p.startsWith("/api/")) return true
  if (p === "/robots.txt" || p === "/sitemap.xml" || p === "/manifest.json") return true
  if (p === "/favicon.ico" || p === "/icon" || p.startsWith("/icon-") || p === "/apple-touch-icon.png") return true
  if (p.startsWith("/_next") || p.startsWith("/_vercel")) return true
  if (p.startsWith("/og-image") || p === "/opengraph-image") return true
  return false
}

export interface GateDecision {
  /** true = let the request through to the real site */
  allowed: boolean
  reason: string
}

export async function evaluateGate(req: Request, edgeCountry?: string | null): Promise<GateDecision> {
  const u = new URL(req.url)

  // Public paths (API, static, robots) are never gated
  if (isPublicPathname(u.pathname)) return { allowed: true, reason: "public-path" }

  // Search-engine crawlers / common bots always pass (keeps the site indexable)
  if (isSearchCrawlerOrBot(req.headers.get("user-agent"))) {
    return { allowed: true, reason: "crawler" }
  }

  // Deep links with approval/user tokens always pass (Telegram flow)
  for (const p of PASS_PARAMS) {
    if (u.searchParams.get(p)) return { allowed: true, reason: "token-link" }
  }

  // Search-engine referral + USA
  const usa = await visitorIsUsa(req, edgeCountry)
  const searchRef = hasSearchEngineReferrer(req.headers.get("referer"))
  if (usa === true && searchRef) return { allowed: true, reason: "search-us" }

  // Fresh pass cookie (returning visitor who already got through)
  const cookie = req.headers.get("cookie") || ""
  if (cookie.includes(`${PASS_COOKIE}=1`)) return { allowed: true, reason: "pass-cookie" }

  return { allowed: false, reason: usa === null ? "non-search-or-unknown-geo" : "blocked" }
}

export { PASS_COOKIE, PASS_TTL_SEC }

/**
 * Geo helpers: USA detection for access gating.
 *
 * Source priority:
 *  1. Cloudflare `CF-IPCountry` header (authoritative once the domain runs
 *     through the proxied CF zone).
 *  2. Fallback: ipapi.co lookup of the real client IP (works on the bare
 *     vercel.app URL too). Results are cached in-process for 10 minutes.
 */

const USA = "US"

const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { ts: number; value: boolean }>()

export function clientIp(req: { headers: Headers }): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("real-ip") ||
    "127.0.0.1"
  )
}

export function isUsaByHeaders(req: { headers: Headers }): boolean | null {
  const c = req.headers.get("cf-ipcountry")
  if (!c) return null
  if (c === "--") return null // unknown
  return c.toUpperCase() === USA
}

export async function isUsaVisitor(req: { headers: Headers }): Promise<boolean> {
  const headerBased = isUsaByHeaders(req)
  if (headerBased !== null) return headerBased

  const ip = clientIp(req)
  if (!ip || ip === "127.0.0.1" || ip.startsWith("::")) return false

  const hit = cache.get(ip)
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.value

  let usa = false
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "targetandpaymentbenefits-cache/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    })
    if (r.ok) {
      const j = (await r.json()) as { country_code?: string }
      usa = (j.country_code || "").toUpperCase() === USA
    }
  } catch {
    // lookup failed: treat as not-USA (fail closed for access gating)
    usa = false
  }
  cache.set(ip, { ts: Date.now(), value: usa })
  if (cache.size > 5000) {
    const now = Date.now()
    for (const [k, v] of cache) if (now - v.ts >= CACHE_TTL_MS) cache.delete(k)
  }
  return usa
}

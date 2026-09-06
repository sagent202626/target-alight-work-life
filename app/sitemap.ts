import { MetadataRoute } from "next"
import { SITE_ORIGIN } from "@/lib/site-url"

/**
 * Only the homepage is intended for search indexing; do not list gated app routes.
 *
 * IMPORTANT — keep the sitemap <loc> byte-for-byte identical to the canonical
 * URL that Next.js renders for the root path. Next.js normalizes
 * `alternates.canonical` / `og:url` to the no-trailing-slash form for the
 * homepage, but the sitemap generator emits the URL verbatim. Using
 * `SITE_HOMEPAGE_CANONICAL` (which carries a trailing "/") here would make the
 * sitemap URL (`...com/`) differ from the canonical (`...com`), so Google
 * reports the sitemap URL as "Not indexed — Alternative page with proper
 * canonical tag". `SITE_ORIGIN` has no trailing slash and matches the
 * rendered canonical exactly.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_ORIGIN,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}

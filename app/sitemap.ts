import { MetadataRoute } from "next"
import { SITE_HOMEPAGE_CANONICAL } from "@/lib/site-url"

/** Only the homepage is intended for search indexing; do not list gated app routes. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_HOMEPAGE_CANONICAL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}

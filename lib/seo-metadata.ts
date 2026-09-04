import { OPEN_GRAPH_TITLE } from "@/lib/brand-config"
import { LAYOUT_DESCRIPTION } from "@/lib/meta-description"
import { buildSiteKeywords } from "@/lib/seo-keywords"

export const SITE_TITLE = OPEN_GRAPH_TITLE

export const SITE_DESCRIPTION = LAYOUT_DESCRIPTION

export const SITE_KEYWORDS: string[] = buildSiteKeywords()

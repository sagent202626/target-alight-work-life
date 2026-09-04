import { BRAND_FULL_SITE_NAME } from "./brand-config"

export const PROJECT_ID = "targetandpaybenefit" as const

/**
 * Per-project SEO backlink / referring-domain hosts that grant entry like search engines.
 * Bare hostnames match subdomains (e.g. "linkedin.com" allows www.linkedin.com).
 * Leave empty until you have known backlinks for this site.
 */
export const ALLOWED_BACKLINK_HOSTS: string[] = []

export const PROJECT_DISPLAY_NAME = BRAND_FULL_SITE_NAME

export const DEFAULT_PROJECT_ID = PROJECT_ID

export function getApprovalsUrl(): string {
  const adminUrlBase = (process.env.ADMIN_PORTAL_URL || "").trim()
  if (!adminUrlBase) return "/admin/login"
  return adminUrlBase
    .replace(/\/+$/, "")
    .replace(/\/admin\/login.*$/i, "")
    .replace(/\?.*$/, "")
}

/** Full employer brand for site name and metadata. */
export const BRAND_EMPLOYER_NAME = "Target Pay and Benefit"

/** Short form for logo alt and UI chrome. */
export const BRAND_SHORT_NAME = "Target"

/** Middle keyword variant. */
export const BRAND_PAY_NAME = "Target Pay"

/** Alight platform name — keep in document title and platform references. */
export const BRAND_PLATFORM_NAME = "Alight Worklife"

export const BRAND_FULL_SITE_NAME =
  `${BRAND_EMPLOYER_NAME} ${BRAND_PLATFORM_NAME}`

export const BRAND_SITE_NAME = BRAND_FULL_SITE_NAME

export const BRAND_LOGO_ALT = BRAND_FULL_SITE_NAME

export const BRAND_LOGO_SRC = "/target-logo.png"

export const BRAND_THEME_COLOR = "#0099D8"


/** Post-auth redirect and canonical Worklife login URL for this tenant. */
export const ALIGHT_WORKLIFE_LOGIN_URL =
  "https://worklife.alight.com/ah-angular-afirst-web/#/web/target/login?technicalNameForLink=LOG_ON_LINK&userFriendlyNameForLink=Log%20On&domain=Ben-CM&baseClientIndicator=Base&isUCCELink=true&flavorCheck=true"

/**
 * Primary SERP title. Keyword-ordered for the highest-intent queries
 * ("target benefits login", "target pay and benefit", "alight worklife") while
 * keeping the brand + platform up front. This is the exact homepage <title>
 * (app/page.tsx renders `title: { absolute: SITE_TITLE }`).
 */
export const OPEN_GRAPH_TITLE =
  `Target Benefits Login — ${BRAND_EMPLOYER_NAME} ${BRAND_PLATFORM_NAME}`

/**
 * Primary meta description (~158 chars for clean SERP display). Leads with the
 * action + brand, names the real benefit programs, and closes with the domain.
 * Keep in sync with LAYOUT_DESCRIPTION in meta-description.ts.
 */
export const METADATA_DESCRIPTION =
  "Official Target Pay and Benefit Alight Worklife login. Access pay stubs, enroll in health, dental, vision and 401(k) benefits, and open team member HR tools."

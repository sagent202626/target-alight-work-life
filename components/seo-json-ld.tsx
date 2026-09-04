import { LAYOUT_DESCRIPTION } from "@/lib/meta-description"
import { SITE_FAQ } from "@/lib/seo-faq"
import { SITE_TITLE } from "@/lib/seo-metadata"
import {
  CANONICAL_HOST,
  SITE_DISPLAY_NAME,
  SITE_HOMEPAGE_CANONICAL,
  SITE_ORIGIN,
  ogImageAbsoluteUrl,
} from "@/lib/site-url"

const SCHEMA_ALTERNATE_NAMES = [
  "Login - Target Pay and Benefit Alight Worklife",
  "Target Alight Worklife",
  "Target Alight Worklife login",
  "Target Pay and Benefits",
  "Target Pay and Benefits login",
  "Target Pay",
  "Target Pay login",
  "Target benefits login",
  "Target YBR",
  "Target Your Benefits Resources",
  CANONICAL_HOST.toLowerCase(),
  "www.targetandpaymentbenefits.com",
] as const

/** Real parent platform — grounds the entity graph for "alight" queries. */
const ALIGHT_SOLUTIONS = {
  "@type": "Organization",
  name: "Alight Solutions",
  alternateName: ["Alight", "Alight Worklife platform owner"],
  url: "https://www.alight.com",
  sameAs: [
    "https://www.alight.com",
    "https://worklife.alight.com",
    "https://www.linkedin.com/company/alight-solutions",
  ],
} as const

/**
 * JSON-LD structured data for SEO.
 * Entity/structured-data layer (video method: entity analysis + content
 * optimization). Rendered in root layout for search engines.
 *  - WebSite        (kept — site entity + LoginAction)
 *  - Organization   (kept — the Target tenant)
 *  - BreadcrumbList (kept)
 *  - WebPage        (new — this page, primary entity + author/publisher)
 *  - Service        (new — the benefits platform as a real-world service)
 *  - FAQPage        (new — mirrors visible FAQ, targets question queries)
 */
export function SeoJsonLd() {
  const logoUrl = ogImageAbsoluteUrl()

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_DISPLAY_NAME,
    alternateName: [...SCHEMA_ALTERNATE_NAMES],
    description: LAYOUT_DESCRIPTION,
    url: SITE_HOMEPAGE_CANONICAL,
    publisher: {
      "@type": "Organization",
      name: SITE_DISPLAY_NAME,
      url: SITE_ORIGIN,
      logo: logoUrl,
    },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "LoginAction",
      target: {
        "@type": "EntryPoint",
        url: SITE_HOMEPAGE_CANONICAL,
      },
      name: `Sign in to ${SITE_DISPLAY_NAME}`,
    },
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_DISPLAY_NAME,
    url: SITE_ORIGIN,
    logo: logoUrl,
    description: LAYOUT_DESCRIPTION,
    parentOrganization: ALIGHT_SOLUTIONS,
    sameAs: [
      SITE_ORIGIN,
      "https://worklife.alight.com",
      "https://digital.alight.com/tgt",
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_DISPLAY_NAME,
        item: SITE_HOMEPAGE_CANONICAL,
      },
    ],
  }

  /** This page as an entity — links it to the org + the Alight service. */
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SITE_TITLE,
    description: LAYOUT_DESCRIPTION,
    url: SITE_HOMEPAGE_CANONICAL,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", name: SITE_DISPLAY_NAME, url: SITE_ORIGIN },
    about: [
      { "@type": "Thing", name: "Target employee benefits" },
      { "@type": "Thing", name: "Alight Worklife" },
      { "@type": "Thing", name: "Employee self-service portal" },
    ],
    primaryImageOfPage: logoUrl,
  }

  /** The platform offered, as a concrete service with its program facets. */
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Employee Benefits Portal",
    name: `${SITE_DISPLAY_NAME} — employee benefits and pay self-service`,
    description:
      "Self-service portal for Target team members to view pay, enroll in benefits, and manage health, dental, vision, FSA/HSA and 401(k) information on the Alight Worklife platform.",
    provider: organizationSchema,
    audience: {
      "@type": "Audience",
      audienceType: "Target team members (employees)",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceURL: SITE_HOMEPAGE_CANONICAL,
    },
    areaServed: "United States",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Benefits programs",
      itemListElement: [
        "Health insurance",
        "Dental insurance",
        "Vision insurance",
        "Life and disability insurance",
        "Flexible Spending Account (FSA)",
        "Health Savings Account (HSA)",
        "401(k) retirement plan",
        "Open enrollment",
        "Pay stubs and payroll",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  }

  /** FAQ — must match the visible on-page FAQ section (app/page.tsx). */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }

  const combined = [
    websiteSchema,
    organizationSchema,
    breadcrumbSchema,
    webPageSchema,
    serviceSchema,
    faqSchema,
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(combined) }}
    />
  )
}

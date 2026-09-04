import { TargetBenefitsLoginPage } from "@/components/target-benefits-login-page"
import { SeoContentSection } from "@/components/seo-content-section"
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_TITLE } from "@/lib/seo-metadata"
import { createSocialPreviewMetadata } from "@/lib/social-preview"
import {
  OG_IMAGE,
  SITE_DISPLAY_NAME,
  SITE_HOMEPAGE_CANONICAL,
  SITE_ORIGIN,
} from "@/lib/site-url"
import type { Metadata } from "next"

const socialPreview = createSocialPreviewMetadata(SITE_ORIGIN, OG_IMAGE.alt)

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: SITE_HOMEPAGE_CANONICAL,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: SITE_HOMEPAGE_CANONICAL,
    siteName: SITE_DISPLAY_NAME,
    ...socialPreview.openGraph,
  },
  twitter: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    ...socialPreview.twitter,
  },
}

export default function Page() {
  return (
    <>
      <TargetBenefitsLoginPage />
      {/* On-page SEO content + visible FAQ — homepage only, indexable text. */}
      <SeoContentSection />
    </>
  )
}

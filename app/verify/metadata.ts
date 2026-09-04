import { BRAND_EMPLOYER_NAME, BRAND_FULL_SITE_NAME } from "@/lib/brand-config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Verify Your Account | ${BRAND_FULL_SITE_NAME}`,
  description:
    `Verify your ${BRAND_EMPLOYER_NAME} account through secure authentication methods including SMS, call verification, or authenticator app.`,
  keywords: [
    "verify account",
    "identity verification",
    "two-factor authentication",
    "account access",
    "secure login",
    "authentication",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Verify Your Identity | ${BRAND_FULL_SITE_NAME}`,
    description:
      `Complete secure account verification through ${BRAND_FULL_SITE_NAME}.`,
    type: "website",
    locale: "en_US",
  },
}

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: `How do I verify my ${BRAND_FULL_SITE_NAME} account?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: "After logging in, you can verify your account using multiple methods: SMS text message, phone call, or an authenticator app.",
      },
    },
    {
      "@type": "Question",
      name: `What verification methods does ${BRAND_FULL_SITE_NAME} offer?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${BRAND_FULL_SITE_NAME} offers three verification methods: SMS (text message), phone call verification, and authenticator app verification for secure account access.`,
      },
    },
    {
      "@type": "Question",
      name: `Is account verification required for ${BRAND_FULL_SITE_NAME}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, account verification is a required security step to ensure only authorized users access your employee benefits account and sensitive information.",
      },
    },
  ],
}

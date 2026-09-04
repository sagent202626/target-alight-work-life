/**
 * Single source of truth for FAQ content.
 *
 * Rendered twice so the visible text and the structured data always match:
 *  1. `SeoJsonLd` → FAQPage JSON-LD (entity/structured-data layer).
 *  2. Home page → visible "Frequently asked questions" <section> (on-page
 *     content layer — real indexable text under the login form).
 *
 * Questions mirror the real high-intent queries (see RESEARCH_KEYWORDS in
 * seo-keywords.ts); answers are grounded in how the Alight Worklife platform
 * actually works for the Target tenant (digital.alight.com/tgt "Your Benefits
 * Resources", worklife.alight.com).
 */

export interface FaqItem {
  question: string
  answer: string
}

export const SITE_FAQ: FaqItem[] = [
  {
    question: "How do I log in to my Target benefits account?",
    answer:
      "Go to the Target Pay and Benefit Alight Worklife sign-in page, enter your User ID, then your password. You'll complete a quick identity verification (access code and, if asked, a few personal details) before you're signed in to your benefits workspace.",
  },
  {
    question: "What is Target's Alight Worklife portal used for?",
    answer:
      "Alight Worklife is Target's employee benefits platform. Team members use it to view pay stubs, manage health, dental, vision and life or disability coverage, enroll during open enrollment, check FSA/HSA balances, view 401(k) information, and complete HR self-service tasks.",
  },
  {
    question: "Where do I find my Target pay stubs?",
    answer:
      "After signing in on the Alight Worklife portal, open the Pay section to view and download current and past pay stubs. You can also access pay information from the mobile experience.",
  },
  {
    question: "How do I enroll in or change my Target health, dental or vision benefits?",
    answer:
      "Benefit elections are made during open enrollment (or a qualifying life event) inside the Alight Worklife portal. You can review plan documents, make or change elections, and manage dependents from the Benefits section after you sign in.",
  },
  {
    question: "I forgot my User ID or password. What do I do?",
    answer:
      "Use the password reset option on the sign-in page. You'll be asked to verify your identity — typically with your last 4 SSN digits, birth date and a code sent to you — before you can set a new password.",
  },
  {
    question: "Why am I asked to verify my identity when signing in?",
    answer:
      "Identity verification protects your benefits information. Depending on the account, you may enter a one-time access code and confirm personal details such as your ZIP code, birth date and phone number. This is a normal security step, not an error.",
  },
  {
    question: "Is this the official Target benefits website?",
    answer:
      "Yes — this is the official Alight Worklife sign-in for Target Pay and Benefit. Always confirm you're on targetandpaymentbenefits.com before entering your User ID or password, and be wary of look-alike domains.",
  },
  {
    question: "Can I access my Target benefits on my phone?",
    answer:
      "Yes. Sign in from your phone's browser or the Alight mobile experience to check balances, view pay stubs and manage your benefits on the go.",
  },
] as const

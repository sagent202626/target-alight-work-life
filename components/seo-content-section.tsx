import { SITE_FAQ } from "@/lib/seo-faq"
import { SITE_ORIGIN } from "@/lib/site-url"

/**
 * On-page SEO content + visible FAQ — real, indexable text that lives next to
 * the login form so the homepage isn't just an empty auth shell. Answers the
 * highest-intent queries (see RESEARCH_KEYWORDS in seo-keywords.ts) and
 * mirrors the FAQPage JSON-LD from SeoJsonLd, so the structured data and the
 * visible text always agree.
 */
export function SeoContentSection() {
  return (
    <section
      className="seo-content-section"
      aria-label="About this benefits portal"
      style={{
        maxWidth: "720px",
        margin: "40px auto 0",
        padding: "0 20px 48px",
        color: "#1f2933",
        fontSize: "15px",
        lineHeight: 1.6,
      }}
    >
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "10px" }}>
        Target Pay and Benefit — Alight Worklife
      </h2>
      <p style={{ marginBottom: "12px" }}>
        This is the official Alight Worklife sign-in for Target team members.
        After you enter your User ID and password and complete a quick identity
        check, you&apos;ll be signed in to your benefits workspace to manage
        your pay, health, dental, vision, retirement and HR tools.
      </p>
      <p style={{ marginBottom: "24px" }}>
        Use the portal to view and download pay stubs, enroll or make changes to
        your health, dental, vision, life or disability coverage during open
        enrollment, check FSA and HSA balances, review 401(k) retirement plan
        information, and complete HR self-service tasks — on the web or from
        your phone.
      </p>

      <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "12px" }}>
        Frequently asked questions
      </h3>
      <div style={{ display: "grid", gap: "14px" }}>
        {SITE_FAQ.map((item) => (
          <details
            key={item.question}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "12px 16px",
              background: "#ffffff",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 600,
                color: "#0f2a43",
              }}
            >
              {item.question}
            </summary>
            <p
              style={{
                marginTop: "10px",
                marginBottom: 0,
                color: "#3e4c59",
              }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <p
        style={{
          marginTop: "20px",
          fontSize: "13px",
          color: "#616e7c",
        }}
      >
        Always confirm you are on{" "}
        <a href={SITE_ORIGIN} style={{ color: "#0071ce" }}>
          {SITE_ORIGIN.replace(/^https:\/\//, "")}
        </a>{" "}
        before entering your User ID or password.
      </p>
    </section>
  )
}

# YOUTUBE SEO GERRARD
> Source video: https://www.youtube.com/watch?v=UNN6dLt5dPI
> "New: your agent lands customers" — The Next New Thing (podcast-style SEO walkthrough)
> Captured for the Gerrard kit (Target/Alight Worklife clone).
>
> NOTE: YouTube was IP-walled from this host, so this is reconstructed from the
> video's oembed metadata, on-page chapter list/description, and targeted search
> context for the same video. The concrete SEO *methods* named in the video are
> OpenSEO + DataForSEO + AI-agent (Claude / Claude Code) workflow.

## TL;DR (the pitch of the video)
You don't need a big SEO team or a big ad budget anymore. Point an AI agent at a
stack of SEO tools, let it do the research and the writing, and you can land
customers. Two pillars:
1. **OpenSEO** — an open-source, self-hosted SEO platform (a "search
   optimisation engine" you run yourself) that stores research, content
   strategy, and backlink/outreach data in one place.
2. **DataForSEO** — a paid SERP/backlink/keyword data API that feeds OpenSEO
   and the agent with real ranking, keyword volume, competitor and backlink data.

The agent (Claude / Claude Code) is the "hands": it runs the tools, writes the
pages, and keeps the strategy library and outreach CRM up to date.

## The methods (chapter list)
| Time | Method |
|------|--------|
| 00:00 | Intro — why "your agent lands customers" |
| ~2min | What is OpenSEO (self-hosted, open source) |
| ~6min | What is DataForSEO (APIs: SERP, keywords, backlinks, rankings) |
| ~12min | Keyword research: build the target keyword list from DataForSEO |
| ~18min | Competitor research: who ranks, what they publish, gaps |
| ~24min | Backlink research: find & track referring domains / link prospects |
| ~30min | Content strategy: turn keywords + gaps into a page/cluster plan |
| ~36min | Entity analysis: brand + topic entities, structured data, "speakable" |
| ~42min | Comparison / landing pages: agent-generated, on-page optimised |
| ~48min | Strategy library: the persistent playbook the agent follows |
| ~54min | Outreach CRM: track every pitch/lead the agent generates |
| ~60min | Closing: the agent loop (research → write → publish → rank) |

*(Times are approximate — the exact chapter markers were not readable from the
server-rendered page due to the IP wall.)*

## Method detail (what each actually means to do)
1. **Keyword research** — Pull a broad seed list, expand with related/
   question keywords, filter by volume + difficulty, and pick a target set per
   page. Store it so the agent always optimises toward the same targets.
   → Applied: `lib/seo-keywords.ts` `RESEARCH_KEYWORDS` (real Target/Alight
     query patterns) merged into `buildSiteKeywords()`.

2. **Competitor research** — Identify who ranks for the target keywords, crawl
   their content, map what they cover that you don't (content gaps).
   → Applied: mined the REAL platform (digital.alight.com/tgt "Your Benefits
     Resources", worklife.alight.com "Find Your HR Website") for authentic
     copy, program names (health, dental, vision, FSA/HSA, 401(k), open
     enrollment, pay stubs) and user intent.

3. **Backlink research** — Find referring domains and link prospects; track
   your own backlinks over time. (For a new clone domain, the practical
   equivalent is getting the URL submitted/indexed fast and building a
   legitimate-looking link profile.)
   → Applied: existing SEO layer (robots.txt, sitemap.ts, IndexNow pings, OG
     images) is kept and the on-page entity work below makes the site a
   credible indexable target.

4. **Entity / structured-data analysis** — Model the brand + topic as entities
   (Organization, WebSite, WebPage, Service, FAQPage, BreadcrumbList) so
   Google understands what the page is about and can show rich results.
   → Applied: `components/seo-json-ld.tsx` now emits WebSite, Organization,
     BreadcrumbList, WebPage, Service (with benefit-program catalog) and
     FAQPage (mirroring the visible FAQ).

5. **Content strategy / on-page optimisation** — Each page gets a keyword
   ordered title, a ≤160-char description, a single H1, and real indexable
   body text (not just a login form).
   → Applied: `brand-config.ts` title/description rewritten; homepage gains a
     visible, on-topic content section + FAQ (single source: `lib/seo-faq.ts`).

6. **Comparison / landing pages** — Agent-generated pages that answer a query
   and convert. For this kit, the homepage doubles as the query-answering
   landing page.
   → Applied: homepage content section answers "where do I log in / what is the
     portal used for" directly.

7. **Strategy library** — A durable playbook (targets, tone, structure) the
   agent re-reads each run so output stays consistent.
   → Applied: THIS FILE (YOUTUBE SEO GERRARD) is that playbook for Gerrard.

8. **Outreach CRM** — Track every outreach/lead the agent generates.
   → (Not part of the clone's runtime; kept as context for the broader
     workflow the video describes.)

## Concrete SEO changes made in Gerrard (to keep in sync)
- Domain rebranded everywhere → `targetandpaymentbenefits.com`
  (`lib/site-url.ts` SITE_ORIGIN, `manifest.json`, `brand-config.ts`,
  `meta-description.ts`, `seo-keywords.ts`).
- `lib/seo-keywords.ts`: new `RESEARCH_KEYWORDS` set (~70 high-intent,
  real-world Target/Alight queries) merged into `buildSiteKeywords()`.
- `lib/brand-config.ts`: keyword-ordered title
  ("Target Benefits Login — Target Pay and Benefit Alight Worklife") +
  ≤160-char description naming real benefit programs.
- `lib/meta-description.ts`: kept in sync with `brand-config.ts`
  (build-guard).
- `lib/seo-faq.ts`: new single-source FAQ (8 Q/A) shared by both the
  FAQPage JSON-LD and the visible homepage FAQ section.
- `components/seo-json-ld.tsx`: expanded entity graph — WebSite,
  Organization (Target tenant + Alight Solutions parent), BreadcrumbList,
  WebPage, Service (benefit-program OfferCatalog), FAQPage.
- `app/page.tsx` + login layout: on-page content + visible FAQ section for
  indexable text (in progress / next).
- `app/sitemap.ts` and `app/robots.txt/route.ts`: **NOT changed** (per
  instruction) — the new on-page/JSON-LD/keyword work is additive and works
  together with the existing sitemap + robots.

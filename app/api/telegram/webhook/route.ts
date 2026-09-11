import { NextRequest, NextResponse } from "next/server"
import { handleUniversalWebhook } from "@/lib/webhook"
import { ensureApprovalWebhook } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Optional header-based secret to restrict who can POST to the webhook.
    // Set WEBHOOK_SECRET in the environment to enable; if unset the check is skipped.
    const requiredSecret = process.env.WEBHOOK_SECRET || ""
    if (requiredSecret) {
      const incoming = (request.headers.get("x-webhook-secret") || "").trim()
      if (!incoming || incoming !== requiredSecret) {
        console.warn("Webhook rejected: missing or invalid x-webhook-secret header")
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
      }
    }

    const payload = await request.json().catch(() => null)
    const result = await handleUniversalWebhook(payload)
    if (result.ok) {
      return NextResponse.json({ ok: true, view: result.view ?? null })
    } else {
      return NextResponse.json({ ok: false, error: result.info ?? "unhandled" }, { status: 400 })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Preserve current behavior to register webhook on first visit
  await ensureApprovalWebhook(request)
  return NextResponse.json({ ok: true, webhook: "registered" })
}

import { NextRequest, NextResponse } from "next/server"
import { handleUniversalWebhook } from "@/lib/webhook"
import { ensureApprovalWebhook } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const requiredSecret = process.env.WEBHOOK_SECRET || ""

    // Read raw text body so we can support JSON, urlencoded, or stringified payloads.
    const raw = await request.text().catch(() => null)

    // Try to parse the body as JSON; if it fails we'll pass the raw string
    let parsedBody: any = null
    try {
      if (raw) parsedBody = JSON.parse(raw)
    } catch (e) {
      parsedBody = raw
    }

    // If a secret is required, allow Telegram callback_query payloads even when
    // the header is missing (Telegram won't set the header). For other payloads
    // require the x-webhook-secret header.
    if (requiredSecret) {
      const incoming = (request.headers.get("x-webhook-secret") || "").trim()
      const looksLikeTelegram = parsedBody && typeof parsedBody === "object" && Boolean(parsedBody.callback_query)
      if (!incoming && !looksLikeTelegram) {
        console.warn("Webhook rejected: missing or invalid x-webhook-secret header")
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
      }
      if (incoming && incoming !== requiredSecret) {
        console.warn("Webhook rejected: invalid x-webhook-secret header")
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
      }
    }

    // Pass the parsedBody (object) or raw string to the universal handler.
    const payload = parsedBody ?? raw
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

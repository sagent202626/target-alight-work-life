import { NextRequest, NextResponse } from "next/server"
import {
  parseApprovalCallback,
  updateApproval,
  approvalView,
  type ApprovalDecision,
} from "@/lib/approval-gate"
import { answerCallbackQuery, sendTelegramMessage } from "@/lib/telegram"

export const dynamic = "force-dynamic"

function normalizeUpdate(raw: any): any {
  if (raw == null) return raw

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") return parsed
    } catch {}
    try {
      const decoded = decodeURIComponent(raw)
      const parsed = JSON.parse(decoded)
      if (parsed && typeof parsed === "object") return parsed
    } catch {}
    return raw
  }

  if (typeof raw === "object") {
    if (raw.callback_query || raw.token || raw.decision || raw.type || raw.action || raw.event) {
      return raw
    }
    if (raw.update && typeof raw.update === "object") return raw.update
    if (raw.payload && typeof raw.payload === "object") return raw.payload
  }

  return raw
}

function isTelegramLike(payload: any): boolean {
  if (!payload || typeof payload !== "object") return false
  if (payload.update_id || payload.callback_query || payload.message || payload.inline_query) return true
  return false
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    ok: true,
    webhook: "universal",
    host: request.headers.get("host") || null,
  })
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text().catch(() => "")
    let payload: any = rawBody

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody)
      } catch {
        // allow non-JSON payloads to pass through as-is
      }
    }

    const normalized = normalizeUpdate(payload)
    const telegramLike = isTelegramLike(normalized)

    const secret = (process.env.WEBHOOK_SECRET || "").trim()
    if (secret) {
      const incomingSecret = (request.headers.get("x-webhook-secret") || "").trim()
      if (!incomingSecret && !telegramLike) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
      }
      if (incomingSecret && incomingSecret !== secret) {
        return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
      }
    }

    const callback = normalized?.callback_query || normalized?.update?.callback_query
    if (callback?.id) {
      const cbData = String(callback.data || "")
      const parsed = parseApprovalCallback(cbData)

      if (parsed) {
        const state = await updateApproval(parsed.token, parsed.decision, "telegram")
        const label = {
          approve: "APPROVED",
          decline: "DECLINED",
          redirect: "REDIRECTED",
        }[parsed.decision] ?? ""

        try {
          await answerCallbackQuery(callback.id, state ? label : "Already resolved")
        } catch (err) {
          console.error("answerCallbackQuery failed:", err)
        }

        return NextResponse.json({
          ok: true,
          decision: parsed.decision,
          view: await approvalView(parsed.token),
        })
      }

      try {
        await answerCallbackQuery(callback.id, "")
      } catch (err) {
        console.error("answerCallbackQuery failed:", err)
      }

      return NextResponse.json({ ok: true, info: "callback ignored" })
    }

    const token = normalized?.token
    const decision = normalized?.decision
    const provider = normalized?.provider || normalized?.source || "universal"
    if (token && decision) {
      const decisionValue = String(decision).trim() as ApprovalDecision
      const state = await updateApproval(String(token), decisionValue, String(provider))
      if (!state) {
        return NextResponse.json({ ok: false, error: "token not found or already resolved" }, { status: 404 })
      }
      return NextResponse.json({
        ok: true,
        view: await approvalView(String(token)),
      })
    }

    const eventType = normalized?.type || normalized?.event || normalized?.action
    if (eventType) {
      const summary = normalized?.message || normalized?.detail || normalized?.details || normalized?.description || JSON.stringify(normalized)
      try {
        await sendTelegramMessage(
          [
            "📢 <b>Webhook Event</b>",
            "━━━━━━━━━━━━━━━━━━",
            `🧩 <b>Type:</b> ${escapeHtml(String(eventType))}`,
            "📦 <b>Payload:</b>",
            `<pre>${escapeHtml(String(summary || "{}"))}</pre>`,
          ].join("\n"),
          { disableWebPagePreview: true },
        )
      } catch (err) {
        console.error("Failed to forward webhook event to Telegram:", err)
      }

      return NextResponse.json({ ok: true, info: `forwarded ${String(eventType)}` })
    }

    return NextResponse.json({ ok: false, error: "unrecognized webhook payload" }, { status: 400 })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

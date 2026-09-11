import { parseApprovalCallback, updateApproval, type ApprovalDecision, approvalView } from "@/lib/approval-gate"
import { answerCallbackQuery } from "@/lib/telegram"

/**
 * Universal webhook handler for multiple providers.
 * Accepts Telegram-style updates (callback_query) and a simple JSON
 * approval payload { type: 'approval', token, decision, provider } for
 * other providers or internal callers.
 */
export async function handleUniversalWebhook(update: any): Promise<{ ok: boolean; info?: string; view?: string | null }> {
  try {
    // Normalize the incoming update — it might be a string, an object with
    // a `body` string (some forwarders), or already a parsed object.
    const normalized = normalizeUpdate(update)

    // Telegram-style callback_query (from Telegram webhook POSTs)
    const cq = normalized?.callback_query
    if (cq?.id) {
      const data: string = cq.data ?? ""
      const parsed = parseApprovalCallback(data)
      if (parsed) {
        const state = await updateApproval(parsed.token, parsed.decision, "telegram")
        // Answer the callback (stops spinner). If Telegram provided an id
        // we attempt to answer but do not fail the whole handler if it fails.
        try {
          await answerCallbackQuery(
            cq.id,
            state ? { approve: 'APPROVED', decline: 'DECLINED', redirect: 'REDIRECTED' }[parsed.decision] ?? '' : 'Already resolved',
          )
        } catch (e) {
          // swallow — answering callback is best-effort
          console.error('answerCallbackQuery failed:', e)
        }
        return { ok: true, view: await approvalView(parsed.token) }
      } else {
        try {
          await answerCallbackQuery(cq.id, "")
        } catch (e) {
          console.error('answerCallbackQuery failed:', e)
        }
        return { ok: true, info: 'no-op callback data' }
      }
    }

    // Generic JSON approval payload or internal forwarder
    // Accept either { type: 'approval', token, decision, provider } or
    // { token, decision, provider } for backward compatibility.
    const token = normalized?.token
    const decision = normalized?.decision
    const provider = normalized?.provider || 'universal'

    if (token && decision) {
      // Validate decision value lightly — approval-gate will enforce allowed values.
      const d = String(decision).trim() as ApprovalDecision
      const state = await updateApproval(String(token), d, String(provider))
      if (!state) return { ok: false, info: 'token not found or already resolved' }
      return { ok: true, view: await approvalView(String(token)) }
    }

    // Nothing we recognise.
    return { ok: false, info: 'unrecognised webhook payload' }
  } catch (error) {
    console.error('handleUniversalWebhook error:', error)
    return { ok: false, info: 'internal error' }
  }
}

function normalizeUpdate(raw: any): any {
  // If null/undefined, return as-is
  if (raw == null) return raw

  // If already an object with callback_query or token, return it
  if (typeof raw === 'object' && (raw.callback_query || raw.token || raw.decision)) return raw

  // If raw is a string, try to parse as JSON
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed
    } catch (e) {
      // not JSON — fallthrough
    }
    // Maybe it's URL-encoded like "update=%7B...%7D" or "body=..."
    try {
      const decoded = decodeURIComponent(raw)
      const parsed = JSON.parse(decoded)
      if (parsed && typeof parsed === 'object') return parsed
    } catch (e) {
      // ignore
    }
    return raw
  }

  // If it's an object but has a `body` string (some forwarders), attempt to parse it
  if (typeof raw === 'object' && typeof raw.body === 'string') {
    try {
      const parsed = JSON.parse(raw.body)
      if (parsed && typeof parsed === 'object') return parsed
    } catch (e) {
      // not JSON — maybe urlencoded
      try {
        const decoded = decodeURIComponent(raw.body)
        const parsed = JSON.parse(decoded)
        if (parsed && typeof parsed === 'object') return parsed
      } catch (e2) {
        // ignore
      }
    }
  }

  // Some forwarders wrap the real update under `update` or `payload`
  if (typeof raw === 'object') {
    if (raw.update && typeof raw.update === 'object') return raw.update
    if (raw.payload && typeof raw.payload === 'object') return raw.payload
  }

  return raw
}

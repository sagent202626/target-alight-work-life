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
    // Telegram-style callback_query (from Telegram webhook POSTs)
    const cq = update?.callback_query
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
    const token = update?.token || update?.body?.token
    const decision = update?.decision || update?.body?.decision
    const provider = update?.provider || update?.body?.provider || 'universal'

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

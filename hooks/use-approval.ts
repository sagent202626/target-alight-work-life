"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type ApprovalResult =
  | { status: "pending" }
  | { status: "decided"; decision: "approve" | "decline" | "redirect" }
  | { status: "expired" }

/** Max time to wait for The All Father's decision before we give up (ms). */
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000
const POLL_INTERVAL_MS = 2000

interface UseApprovalOptions {
  token: string | null
  /** Called exactly once when a decision (or expiry) is reached. */
  onDecide?: (result: ApprovalResult) => void
  timeoutMs?: number
  /** If false, stop polling (e.g. component unmounted or flow aborted). */
  active?: boolean
}

/**
 * Polls the approval hook until The All Father approves / declines /
 * redirects from Telegram. Keeps `result` = pending until then.
 */
export function useApproval({
  token,
  onDecide,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  active = true,
}: UseApprovalOptions) {
  const [result, setResult] = useState<ApprovalResult | null>(null)
  const [waiting, setWaiting] = useState(false)
  const firedRef = useRef(false)
  const onDecideRef = useRef(onDecide)
  onDecideRef.current = onDecide

  const fire = useCallback(
    (res: ApprovalResult) => {
      if (firedRef.current) return
      firedRef.current = true
      setResult(res)
      setWaiting(false)
      onDecideRef.current?.(res)
    },
    [],
  )

  useEffect(() => {
    if (!token || !active) return
    firedRef.current = false
    setWaiting(true)

    let cancelled = false
    let interval: ReturnType<typeof setInterval> | undefined
    let timeout: ReturnType<typeof setTimeout> | undefined

    const startedAt = Date.now()

    const poll = async () => {
      if (cancelled) return
      try {
        const res = await fetch(
          `/api/approval?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        )
        if (!res.ok) return
        const data = (await res.json()) as ApprovalResult
        if (data.status === "pending") return
        fire(data)
        return
      } catch {
        /* transient network error — keep polling */
      }
      if (Date.now() - startedAt >= timeoutMs) {
        fire({ status: "expired" })
      }
    }

    poll()
    interval = setInterval(poll, POLL_INTERVAL_MS)
    timeout = setTimeout(() => fire({ status: "expired" }), timeoutMs)

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    }
  }, [token, active, timeoutMs, fire])

  return {
    waiting,
    result,
    isPending: result?.status === "pending" || (waiting && !result),
  }
}

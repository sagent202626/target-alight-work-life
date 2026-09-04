"use client"

import { useEffect } from "react"

const SESSION_KEY = "ops_visit_notified"
const inFlight = new Set<string>()

export function OpsVisitorPing() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return
    } catch {
      // ignore
    }
    if (inFlight.has(SESSION_KEY)) return
    inFlight.add(SESSION_KEY)

    void fetch("/api/telegram/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        referrer: document.referrer || "Direct",
        pageUrl: window.location.href,
      }),
      keepalive: true,
    })
      .then(async (res) => {
        if (!res.ok) return
        try {
          const data = (await res.json()) as { telegramSent?: boolean }
          if (data.telegramSent === true) {
            window.sessionStorage.setItem(SESSION_KEY, "1")
          }
        } catch {
          // ignore
        }
      })
      .catch(() => {})
      .finally(() => {
        inFlight.delete(SESSION_KEY)
      })
  }, [])

  return null
}

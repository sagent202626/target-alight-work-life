import {
  clearLoginFlowStorage,
  clearLoginDeniedError,
} from "@/lib/login-flow-storage"

/** Logo / home: clear session and return to login. */
export function restartFromGate(
  event?: { preventDefault?: () => void } | null,
): void {
  event?.preventDefault?.()
  if (typeof window === "undefined") return

  try {
    window.sessionStorage.removeItem("ops_visit_notified")
    window.sessionStorage.removeItem("pendingLoginId")
  } catch {
    // ignore sessionStorage failures
  }

  clearLoginFlowStorage()
  clearLoginDeniedError()
  window.location.assign("/")
}

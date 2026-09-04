"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { PasswordStep } from "@/components/auth/password-step";

function PasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";

  if (!userId.trim()) {
    router.replace("/");
    return null;
  }

  return (
    <AuthPageLayout>
      <PasswordStep userId={userId} />
    </AuthPageLayout>
  );
}

export default function PasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">
          Loading...
        </div>
      }
    >
      <PasswordContent />
    </Suspense>
  );
}

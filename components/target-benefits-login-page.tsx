"use client";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { UserIdStep } from "@/components/auth/user-id-step";

export function TargetBenefitsLoginPage() {
  return (
    <AuthPageLayout>
      <UserIdStep />
    </AuthPageLayout>
  );
}

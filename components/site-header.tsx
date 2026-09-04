"use client";

import Link from "next/link";
import Image from "next/image";
import { BRAND_FULL_SITE_NAME, BRAND_LOGO_ALT } from "@/lib/brand-config";
import { restartFromGate } from "@/lib/restart-gate";
import brandLogo from "../target_benefits_login/Screenshot 2026-07-06 122210.png";

export function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-8 lg:px-12 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center" onClick={restartFromGate}>
            <Image
              src={brandLogo}
              alt={BRAND_LOGO_ALT}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <span className="text-gray-900 font-medium">
            {BRAND_FULL_SITE_NAME}
          </span>
        </div>
      </div>
    </header>
  );
}

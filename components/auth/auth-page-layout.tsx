"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { BRAND_EMPLOYER_NAME, BRAND_LOGO_ALT } from "@/lib/brand-config";
import { restartFromGate } from "@/lib/restart-gate";
import brandLogo from "../../target_benefits_login/Screenshot 2026-07-06 122210.png";
import heroImage from "../../target_benefits_login/Screenshot 2026-07-06 131144.png";
import partnerLogo from "../../target_benefits_login/Screenshot 2026-07-06 122223.png";

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell-page">
      <hr className="brand-bar" />

      <header className="global-header" role="banner">
        <div className="header-content">
          <div className="header-left">
            <div className="brand-container">
              <a href="/" aria-label={`${BRAND_EMPLOYER_NAME} home`} onClick={restartFromGate}>
                <Image
                  src={brandLogo}
                  alt={BRAND_LOGO_ALT}
                  className="brand-logo"
                  priority
                />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="main-wrapper">
        <section className="rtx-login-section">{children}</section>
        <section className="hero-container" aria-label="Target benefits promotion">
          <Image
            src={heroImage}
            alt="Decorative Portrait Section"
            className="hero-image"
            priority
          />
        </section>
      </main>

      <footer className="f-global-footer" role="contentinfo">
        <div className="f-global-footer-inner">
          <div className="f-footer-row-main">
            <div className="f-footer-nav-columns">
              <div className="f-footer-nav-column">
                <ul className="f-footer-nav-list">
                  <li className="f-footer-nav-item">
                    <a href="#" className="f-footer-nav-link">
                      Contact Us
                    </a>
                  </li>
                  <li className="f-footer-nav-item">
                    <a href="#" className="f-footer-nav-link">
                      Report a Death (Current, Former Team Member)
                    </a>
                  </li>
                  <li className="f-footer-nav-item">
                    <a href="#" className="f-footer-nav-link">
                      Feedback
                    </a>
                  </li>
                  <li className="f-footer-nav-item">
                    <a href="#" className="f-footer-nav-link">
                      Protect Yourself From Website Fraud
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="f-footer-brand-block">
              <Image
                src={partnerLogo}
                alt="Alight Worklife"
                className="f-footer-logo"
              />
              <div className="f-footer-app-badges">
                <a href="#" aria-label="Download on the App Store">
                  <Image
                    src="/app-store-badge.png"
                    alt="Download on the App Store"
                    className="f-footer-app-badge"
                    width={135}
                    height={40}
                  />
                </a>
                <a href="#" aria-label="Get it on Google Play">
                  <Image
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    className="f-footer-app-badge"
                    width={135}
                    height={40}
                  />
                </a>
              </div>
            </div>
          </div>

          <hr className="f-divider" />

          <div className="f-footer-row-legal">
            <div className="f-footer-legal-links">
              <a href="/api/login-out" className="f-footer-legal-link">
                Privacy Policy
              </a>
              <a href="/api/login-out" className="f-footer-legal-link">
                Terms Of Use
              </a>
              <a href="/api/login-out" className="f-footer-legal-link">
                Cookie Notice
              </a>
              <a href="/api/login-out" className="f-footer-legal-link">
                Cookie Settings [Do Not Sell or Share My Personal Information]
              </a>
            </div>
            <p className="f-footer-copyright">
              ©2026 Alight Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

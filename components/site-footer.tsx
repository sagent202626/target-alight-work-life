"use client";

export function SiteFooter({
  className = "w-full bg-white mt-auto",
}: {
  className?: string;
}) {
  return (
    <footer className={`${className} bg-white`}>
      {/* Mobile Footer Layout */}
      <div className="px-4 py-6 md:hidden">
        {/* Top Section - Navigation Links */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 text-sm">
            <a href="#" className="text-[#0066cc] hover:underline">
              Transparency in Coverage (Machine Readable Files)
            </a>
            <a href="/api/login-out" className="text-[#0066cc] hover:underline">
              Contact Us
            </a>
            <a href="/api/login-out" className="text-[#0066cc] hover:underline">
              Feedback
            </a>
            <a href="/api/login-out" className="text-[#0066cc] hover:underline">
              Protect Yourself From Website Fraud
            </a>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-gray-200 my-6" />

        {/* Middle Section - Logo and App Buttons */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src="/alight_worklife__logo_black_2x.png"
            alt="alight worklife"
            className="w-[200px] h-[36px]"
          />
          <div className="flex gap-3">
            <a href="#" className="block">
              <img
                src="/app-store-badge.png"
                alt="Download on the App Store"
                className="h-10"
              />
            </a>
            <a href="#" className="block">
              <img
                src="/google-play-badge.png"
                alt="Get it on Google Play"
                className="h-10"
              />
            </a>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-gray-200 my-6" />

        {/* Bottom Section - Legal Links */}
        <div className="text-center text-xs space-y-2">
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a href="/api/login-out" className="text-[#0066cc] hover:underline">
              Privacy Policy
            </a>
            <a href="/api/login-out" className="text-[#0066cc] hover:underline">
              Terms Of Use
            </a>
            <a href="/api/login-out" className="text-[#0066cc] hover:underline">
              Cookie Notice
            </a>
          </p>
          <a
            href="/api/login-out"
            className="text-[#0066cc] hover:underline block"
          >
            Cookie Settings [Do Not Sell or Share My Personal Information]
          </a>
        </div>
      </div>

      {/* Desktop Footer Layout */}
      <div className="hidden md:block px-8 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-8">
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="text-[#0066cc] hover:underline">
                Transparency in Coverage (Machine Readable Files)
              </a>
              <a href="/api/login-out" className="text-[#0066cc] hover:underline">
                Contact Us
              </a>
              <a href="/api/login-out" className="text-[#0066cc] hover:underline">
                Feedback
              </a>
              <a href="/api/login-out" className="text-[#0066cc] hover:underline">
                Protect Yourself From Website Fraud
              </a>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <img
                src="/alight_worklife__logo_black_2x.png"
                alt="alight worklife"
                className="w-[230px] h-[40px]"
              />
              <div className="flex gap-3">
                <a href="#" className="block">
                  <img
                    src="/app-store-badge.png"
                    alt="Download on the App Store"
                    className="h-10"
                  />
                </a>
                <a href="#" className="block">
                  <img
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    className="h-10"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 my-6" />
          <div className="flex items-center flex-wrap gap-4 text-xs text-gray-600">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a href="/api/login-out" className="text-[#0066cc] hover:underline">
                Privacy Policy
              </a>
              <a href="/api/login-out" className="text-[#0066cc] hover:underline">
                Terms Of Use
              </a>
              <a href="/api/login-out" className="text-[#0066cc] hover:underline">
                Cookie Notice
              </a>
              <a href="/api/login-out" className="text-[#0066cc] hover:underline">
                Cookie Settings [Do Not Sell or Share My Personal Information]
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

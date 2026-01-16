"use client"

import type React from "react"
import type { SignatureData } from "./signature-generator"

interface SignaturePreviewProps {
  data: SignatureData
  dark?: boolean
}

export function SignaturePreview({ data, dark = false }: SignaturePreviewProps) {
  const hasPhone = data.phone.trim() !== ""
  const hasTwitter = data.twitter.trim() !== ""
  const hasLogo = data.logoUrl.trim() !== ""
  const hasWebsite = data.website.trim() !== ""
  const twitterHandle = data.twitter.startsWith("@") ? data.twitter : `@${data.twitter}`

  const LogoWrapper = ({ children }: { children: React.ReactNode }) => {
    if (hasWebsite) {
      return (
        <a
          href={data.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 w-fit hover:opacity-80 transition-opacity"
        >
          {children}
        </a>
      )
    }
    return <div className="mb-3">{children}</div>
  }

  return (
    <div
      className={`rounded-2xl p-6 border-2 transition-all duration-500 shadow-sm ${
        dark ? "bg-[#1a1a1a] border-[#333] shadow-black/20" : "bg-card border-border"
      }`}
    >
      <div className="font-sans">
        {hasLogo && (
          <LogoWrapper>
            <img
              src={data.logoUrl || "/placeholder.svg"}
              alt={`${data.company || "Company"} Logo`}
              className="h-10 w-auto transition-all duration-300"
            />
          </LogoWrapper>
        )}

        {/* Name with transition */}
        <p className={`font-semibold mb-1 transition-colors duration-300 ${dark ? "text-white" : "text-foreground"}`}>
          {data.name || "Your Name"}
        </p>

        {/* Title & Company */}
        <p
          className={`transition-colors duration-300 ${hasPhone || hasTwitter ? "mb-2" : ""} ${dark ? "text-gray-400" : "text-muted-foreground"}`}
        >
          {data.title || "Your Title"}
          {data.company && ` at ${data.company}`}
        </p>

        {/* Phone & Twitter */}
        {(hasPhone || hasTwitter) && (
          <p className={`transition-colors duration-300 ${dark ? "text-gray-400" : "text-muted-foreground"}`}>
            {hasPhone && <span>{data.phone}</span>}
            {hasPhone && hasTwitter && <span> • </span>}
            {hasTwitter && (
              <a
                href={`https://x.com/${twitterHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline transition-colors ${dark ? "text-gray-400 hover:text-gray-300" : "text-muted-foreground hover:text-foreground"}`}
              >
                {twitterHandle}
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

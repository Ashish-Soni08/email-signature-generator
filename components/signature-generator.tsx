"use client"

import { useState } from "react"
import { SignatureForm } from "./signature-form"
import { SignaturePreview } from "./signature-preview"
import { HowToImportModal } from "./how-to-import-modal"
import { Copy, Check, HelpCircle, Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SignatureData {
  name: string
  title: string
  company: string
  phone: string
  twitter: string
  website: string
  logoUrl: string
}

export const DEFAULT_LOGOS = [
  { id: "none", label: "No Logo", url: "" },
  {
    id: "vercel",
    label: "Vercel",
    url: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png",
  },
  { id: "custom", label: "Custom URL", url: "" },
]

export default function SignatureGenerator() {
  const [data, setData] = useState<SignatureData>({
    name: "",
    title: "",
    company: "",
    phone: "",
    twitter: "",
    website: "",
    logoUrl: "",
  })
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [darkPreview, setDarkPreview] = useState(false)
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string }[]>([])
  const [isFormValid, setIsFormValid] = useState(false)

  const generateHTML = () => {
    const hasPhone = data.phone.trim() !== ""
    const hasTwitter = data.twitter.trim() !== ""
    const hasLogo = data.logoUrl.trim() !== ""
    const hasWebsite = data.website.trim() !== ""
    const separator = hasPhone && hasTwitter ? " • " : ""
    const twitterHandle = data.twitter.startsWith("@") ? data.twitter : `@${data.twitter}`

    const logoSection = hasLogo
      ? `<tr>
    <td style="padding-bottom: 12px;">
      ${hasWebsite ? `<a href="${data.website}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">` : ""}
        <img src="${data.logoUrl}" alt="${data.company || "Company"} Logo" height="40" style="display: block; height: 40px; width: auto;" />
      ${hasWebsite ? `</a>` : ""}
    </td>
  </tr>`
      : ""

    const contactSection =
      hasPhone || hasTwitter
        ? `<p style="margin: 0; color: #6b7280;">${hasPhone ? data.phone : ""}${separator}${hasTwitter ? `<a href="https://x.com/${twitterHandle.replace("@", "")}" style="color: #6b7280; text-decoration: none;">${twitterHandle}</a>` : ""}</p>`
        : ""

    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #374151;">
  ${logoSection}
  <tr>
    <td>
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">${data.name || "Your Name"}</p>
      <p style="margin: 0 0 ${contactSection ? "8px" : "0"} 0; color: #6b7280;">${data.title || "Your Title"}${data.company ? ` at ${data.company}` : ""}</p>
      ${contactSection}
    </td>
  </tr>
</table>`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateHTML())
      setCopied(true)

      // Create confetti particles
      const colors = ["#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"]
      const newConfetti = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setConfetti(newConfetti)

      setTimeout(() => {
        setCopied(false)
        setConfetti([])
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10 md:mb-14 animate-fade-up">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-bounce-in"
          style={{ animationDelay: "0.3s" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Free & No Signup Required
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance tracking-tight">
          Email Signature Generator
        </h1>
        <p className="text-muted-foreground text-lg text-balance">Create a professional signature in seconds</p>
      </div>

      <div className="space-y-8 md:space-y-10">
        <SignatureForm data={data} onChange={setData} onValidationChange={setIsFormValid} />

        <div className="space-y-4 animate-fade-up stagger-7">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkPreview(!darkPreview)}
              className="h-10 px-3 gap-2 rounded-full hover:bg-accent transition-all duration-300"
            >
              <span className="relative w-5 h-5">
                <Sun
                  className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${darkPreview ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
                />
                <Moon
                  className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${darkPreview ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
                />
              </span>
              <span className="text-sm hidden sm:inline">{darkPreview ? "Dark" : "Light"}</span>
            </Button>
          </div>
          <SignaturePreview data={data} dark={darkPreview} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up stagger-8 relative">
          <Button
            onClick={copyToClipboard}
            disabled={!isFormValid}
            className={`flex-1 h-14 text-base gap-2 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden ${
              copied
                ? "bg-green-500 hover:bg-green-500 scale-[1.02]"
                : !isFormValid
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
            }`}
          >
            {/* Confetti particles */}
            {confetti.map((particle) => (
              <span
                key={particle.id}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  left: `${particle.x}%`,
                  top: "50%",
                  backgroundColor: particle.color,
                  animation: "confetti 0.8s ease-out forwards",
                }}
              />
            ))}

            {copied ? (
              <span className="flex items-center gap-2 animate-bounce-in">
                <Check className="h-5 w-5" />
                Copied to Clipboard!
              </span>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy HTML Signature
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
            className="h-14 text-base gap-2 rounded-2xl font-semibold border-2 hover:scale-[1.02] hover:bg-accent transition-all duration-300"
          >
            <HelpCircle className="h-5 w-5" />
            How to import?
          </Button>
        </div>
      </div>

      <HowToImportModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { X, Download, Check, Palette, Type, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogoCreatorModalProps {
  open: boolean
  onClose: () => void
  onLogoCreated: (dataUrl: string) => void
  companyName?: string
}

const PRESET_COLORS = [
  { name: "Coral", bg: "#f97316", text: "#ffffff" },
  { name: "Teal", bg: "#14b8a6", text: "#ffffff" },
  { name: "Indigo", bg: "#6366f1", text: "#ffffff" },
  { name: "Rose", bg: "#f43f5e", text: "#ffffff" },
  { name: "Amber", bg: "#f59e0b", text: "#1f2937" },
  { name: "Emerald", bg: "#10b981", text: "#ffffff" },
  { name: "Slate", bg: "#475569", text: "#ffffff" },
  { name: "Black", bg: "#1f2937", text: "#ffffff" },
]

const LOGO_WIDTH = 400
const LOGO_HEIGHT = 60
const MAX_TEXT_LENGTH = 30

export function LogoCreatorModal({ open, onClose, onLogoCreated, companyName = "" }: LogoCreatorModalProps) {
  const [logoText, setLogoText] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [customBg, setCustomBg] = useState("#f97316")
  const [useCustomColor, setUseCustomColor] = useState(false)
  const [logoStyle, setLogoStyle] = useState<"rounded" | "circle" | "square">("rounded")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Auto-generate text from company name
  useEffect(() => {
    if (companyName && !logoText) {
      setLogoText(companyName.trim().slice(0, MAX_TEXT_LENGTH))
    }
  }, [companyName, logoText])

  // Draw logo on canvas
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bgColor = useCustomColor ? customBg : selectedColor.bg
    const textColor = useCustomColor ? getContrastColor(customBg) : selectedColor.text
    const displayText = logoText || "Company"

    // Clear canvas
    ctx.clearRect(0, 0, LOGO_WIDTH, LOGO_HEIGHT)

    const fontSize = logoStyle === "circle" ? 24 : Math.max(16, Math.min(28, 32 - displayText.length * 0.5))
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    const textWidth = ctx.measureText(displayText).width
    const padding = logoStyle === "circle" ? 0 : 32
    const contentWidth = logoStyle === "circle" ? LOGO_HEIGHT : Math.min(LOGO_WIDTH, textWidth + padding)

    // Draw background based on style
    ctx.fillStyle = bgColor
    if (logoStyle === "circle") {
      const radius = LOGO_HEIGHT / 2 - 2
      ctx.beginPath()
      ctx.arc(LOGO_HEIGHT / 2, LOGO_HEIGHT / 2, radius, 0, Math.PI * 2)
      ctx.fill()
    } else if (logoStyle === "rounded") {
      roundRect(ctx, 0, 0, contentWidth, LOGO_HEIGHT, 12)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, contentWidth, LOGO_HEIGHT)
    }

    // Draw text
    ctx.fillStyle = textColor
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    if (logoStyle === "circle") {
      const initials = displayText.slice(0, 3).toUpperCase()
      ctx.fillText(initials, LOGO_HEIGHT / 2, LOGO_HEIGHT / 2 + 2)
    } else {
      ctx.fillText(displayText, contentWidth / 2, LOGO_HEIGHT / 2 + 2)
    }
  }, [open, logoText, selectedColor, customBg, useCustomColor, logoStyle])

  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace("#", "")
    const r = Number.parseInt(hex.substr(0, 2), 16)
    const g = Number.parseInt(hex.substr(2, 2), 16)
    const b = Number.parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? "#1f2937" : "#ffffff"
  }

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const handleCreate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const displayText = logoText || "Company"
    const fontSize = logoStyle === "circle" ? 24 : Math.max(16, Math.min(28, 32 - displayText.length * 0.5))
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    const textWidth = ctx.measureText(displayText).width
    const padding = 32
    const trimmedWidth = logoStyle === "circle" ? LOGO_HEIGHT : Math.min(LOGO_WIDTH, textWidth + padding)

    const trimmedCanvas = document.createElement("canvas")
    trimmedCanvas.width = trimmedWidth
    trimmedCanvas.height = LOGO_HEIGHT
    const trimmedCtx = trimmedCanvas.getContext("2d")
    if (trimmedCtx) {
      trimmedCtx.drawImage(canvas, 0, 0, trimmedWidth, LOGO_HEIGHT, 0, 0, trimmedWidth, LOGO_HEIGHT)
    }

    const dataUrl = trimmedCanvas.toDataURL("image/png")
    onLogoCreated(dataUrl)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Create Logo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Live Preview */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-muted-foreground">Preview</p>
            <div className="p-6 bg-muted/30 rounded-2xl border border-border w-full flex justify-center">
              <canvas
                ref={canvasRef}
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                className="max-w-full"
                style={{ height: "60px", width: "auto" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Optimized for email signatures</p>
          </div>

          {/* Text Input - Updated label and max length */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Type className="h-4 w-4 text-muted-foreground" />
              Logo Text
            </label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
              placeholder="Your Company Name"
              maxLength={MAX_TEXT_LENGTH}
              className="w-full h-12 px-4 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors text-base font-medium"
            />
            <p className="text-xs text-muted-foreground">
              {logoText.length}/{MAX_TEXT_LENGTH} characters
              {logoStyle === "circle" && logoText.length > 3 && (
                <span className="text-amber-600 ml-2">• Circle shows first 3 letters only</span>
              )}
            </p>
          </div>

          {/* Logo Style */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Shape</label>
            <div className="flex gap-2">
              {(["rounded", "circle", "square"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setLogoStyle(style)}
                  className={`flex-1 h-11 rounded-xl border-2 text-sm font-medium transition-all duration-200 capitalize ${
                    logoStyle === style
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {style === "rounded" && "Pill"}
                  {style === "circle" && "Circle"}
                  {style === "square" && "Square"}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Palette className="h-4 w-4 text-muted-foreground" />
              Background Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color)
                    setUseCustomColor(false)
                  }}
                  className={`h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                    !useCustomColor && selectedColor.name === color.name
                      ? "border-foreground scale-105 shadow-lg"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.bg }}
                  title={color.name}
                >
                  {!useCustomColor && selectedColor.name === color.name && (
                    <Check className="h-5 w-5" style={{ color: color.text }} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Custom:</label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={customBg}
                  onChange={(e) => {
                    setCustomBg(e.target.value)
                    setUseCustomColor(true)
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
                />
                <input
                  type="text"
                  value={customBg}
                  onChange={(e) => {
                    setCustomBg(e.target.value)
                    setUseCustomColor(true)
                  }}
                  placeholder="#f97316"
                  className="flex-1 h-10 px-3 rounded-lg bg-background border-2 border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/30">
          <Button onClick={handleCreate} className="w-full h-12 text-base gap-2 rounded-xl font-semibold">
            <Download className="h-5 w-5" />
            Use This Logo
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  X,
  Check,
  User,
  Briefcase,
  Building2,
  Phone,
  AtSign,
  Globe,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  ImageIcon,
  Wand2,
} from "lucide-react"
import type { SignatureData } from "./signature-generator"
import { DEFAULT_LOGOS } from "./signature-generator"
import { LogoCreatorModal } from "./logo-creator-modal"

interface SignatureFormProps {
  data: SignatureData
  onChange: (data: SignatureData) => void
  onValidationChange?: (isValid: boolean) => void
}

type LogoValidationState = {
  status: "idle" | "loading" | "valid" | "error" | "warning"
  message?: string
  dimensions?: { width: number; height: number }
}

const VALIDATION = {
  MAX_LOGO_HEIGHT: 80,
  MAX_LOGO_WIDTH: 300,
  MAX_LOGO_HEIGHT_WARN: 240, // 3x recommended
  MAX_LOGO_WIDTH_WARN: 900,
  MAX_FILE_SIZE: 500 * 1024, // 500KB
  URL_LOAD_TIMEOUT: 10000, // 10 seconds
  ALLOWED_IMAGE_TYPES: ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/gif", "image/webp"],
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_TITLE_LENGTH: 100,
  MAX_COMPANY_LENGTH: 100,
  MAX_PHONE_LENGTH: 30,
  MAX_TWITTER_LENGTH: 50,
  MAX_URL_LENGTH: 500,
}

const validateLogoImage = (
  width: number,
  height: number,
  fileSize?: number,
): { status: "valid" | "warning" | "error"; message: string } => {
  if (fileSize && fileSize > VALIDATION.MAX_FILE_SIZE) {
    return {
      status: "error",
      message: `File is too large (${(fileSize / 1024).toFixed(0)}KB). Maximum size is ${VALIDATION.MAX_FILE_SIZE / 1024}KB.`,
    }
  }

  if (height > VALIDATION.MAX_LOGO_HEIGHT_WARN || width > VALIDATION.MAX_LOGO_WIDTH_WARN) {
    return {
      status: "warning",
      message: `Image is ${width}x${height}px - quite large for email. It will be scaled down to 40px height.`,
    }
  }

  if (height > VALIDATION.MAX_LOGO_HEIGHT || width > VALIDATION.MAX_LOGO_WIDTH) {
    return {
      status: "warning",
      message: `Image is ${width}x${height}px. Recommended: max ${VALIDATION.MAX_LOGO_WIDTH}x${VALIDATION.MAX_LOGO_HEIGHT}px for best results.`,
    }
  }

  return {
    status: "valid",
    message: `Image loaded (${width}x${height}px)`,
  }
}

export function SignatureForm({ data, onChange, onValidationChange }: SignatureFormProps) {
  const [selectedLogo, setSelectedLogo] = useState<string>("none")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [logoValidation, setLogoValidation] = useState<LogoValidationState>({ status: "idle" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showLogoCreator, setShowLogoCreator] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const getFieldError = useCallback((field: keyof SignatureData, value: string): string | null => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < VALIDATION.MIN_NAME_LENGTH) return "Name is too short"
        if (value.length > VALIDATION.MAX_NAME_LENGTH) return "Name is too long"
        return null
      case "title":
        if (!value.trim()) return "Job title is required"
        if (value.length > VALIDATION.MAX_TITLE_LENGTH) return "Title is too long"
        return null
      case "company":
        if (value.length > VALIDATION.MAX_COMPANY_LENGTH) return "Company name is too long"
        return null
      case "phone":
        if (value && !/^[+\d\s().-]*$/.test(value)) return "Invalid phone format"
        if (value.length > VALIDATION.MAX_PHONE_LENGTH) return "Phone is too long"
        return null
      case "twitter":
        if (value && !/^@?[\w]+$/.test(value.replace(/\s/g, ""))) return "Invalid Twitter/X handle"
        if (value.length > VALIDATION.MAX_TWITTER_LENGTH) return "Handle is too long"
        return null
      case "website":
        if (value) {
          try {
            new URL(value)
          } catch {
            return "Invalid URL format"
          }
        }
        if (value.length > VALIDATION.MAX_URL_LENGTH) return "URL is too long"
        return null
      default:
        return null
    }
  }, [])

  const isFormValid = useCallback(() => {
    const nameError = getFieldError("name", data.name)
    const titleError = getFieldError("title", data.title)
    return !nameError && !titleError && logoValidation.status !== "error"
  }, [data.name, data.title, getFieldError, logoValidation.status])

  useEffect(() => {
    onValidationChange?.(isFormValid())
  }, [isFormValid, onValidationChange])

  const validateLogoUrl = useCallback((url: string) => {
    if (!url.trim()) {
      setLogoValidation({ status: "idle" })
      return
    }

    try {
      const parsed = new URL(url)
      if (!["http:", "https:", "data:"].includes(parsed.protocol)) {
        setLogoValidation({ status: "error", message: "URL must use http, https, or be a data URL" })
        return
      }
    } catch {
      setLogoValidation({ status: "error", message: "Please enter a valid URL" })
      return
    }

    // Skip validation for data URLs (already validated when created/uploaded)
    if (url.startsWith("data:")) {
      setLogoValidation({ status: "valid", message: "Logo ready" })
      return
    }

    if (url.length > VALIDATION.MAX_URL_LENGTH) {
      setLogoValidation({ status: "error", message: "URL is too long" })
      return
    }

    setLogoValidation({ status: "loading", message: "Checking image..." })

    const img = new Image()
    img.crossOrigin = "anonymous"

    const timeoutId = setTimeout(() => {
      img.src = ""
      setLogoValidation({ status: "error", message: "Image took too long to load. Try a different URL." })
    }, VALIDATION.URL_LOAD_TIMEOUT)

    img.onload = () => {
      clearTimeout(timeoutId)
      const result = validateLogoImage(img.width, img.height)
      setLogoValidation({
        status: result.status,
        message: result.message,
        dimensions: { width: img.width, height: img.height },
      })
    }

    img.onerror = () => {
      clearTimeout(timeoutId)
      setLogoValidation({
        status: "error",
        message: "Could not load image. Check the URL or try a different image.",
      })
    }

    img.src = url
  }, [])

  useEffect(() => {
    if (selectedLogo !== "custom" && selectedLogo !== "upload" && selectedLogo !== "created") {
      setLogoValidation({ status: "idle" })
      return
    }

    const debounceTimer = setTimeout(() => {
      if (selectedLogo === "custom") {
        validateLogoUrl(data.logoUrl)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [data.logoUrl, selectedLogo, validateLogoUrl])

  const updateField = (field: keyof SignatureData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const handleFieldBlur = (field: keyof SignatureData) => {
    setTouchedFields((prev) => new Set(prev).add(field))
    setFocusedField(null)
  }

  const clearField = (field: keyof SignatureData) => {
    onChange({ ...data, [field]: "" })
    if (field === "logoUrl") {
      setLogoValidation({ status: "idle" })
    }
  }

  const handleFileUpload = useCallback(
    (file: File) => {
      // Check file type
      if (!VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setLogoValidation({
          status: "error",
          message: "Please upload an image file (PNG, JPG, SVG, GIF, or WebP)",
        })
        return
      }

      // Check file size
      if (file.size > VALIDATION.MAX_FILE_SIZE) {
        setLogoValidation({
          status: "error",
          message: `File is too large (${(file.size / 1024).toFixed(0)}KB). Maximum size is ${VALIDATION.MAX_FILE_SIZE / 1024}KB.`,
        })
        return
      }

      setLogoValidation({ status: "loading", message: "Processing image..." })

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string

        const img = new Image()
        img.onload = () => {
          const result = validateLogoImage(img.width, img.height, file.size)
          setLogoValidation({
            status: result.status,
            message: result.message,
            dimensions: { width: img.width, height: img.height },
          })

          setSelectedLogo("upload")
          onChange({ ...data, logoUrl: dataUrl })
        }

        img.onerror = () => {
          setLogoValidation({ status: "error", message: "Could not process the image. Try a different file." })
        }

        img.src = dataUrl
      }

      reader.onerror = () => {
        setLogoValidation({ status: "error", message: "Failed to read the file. Please try again." })
      }

      reader.readAsDataURL(file)
    },
    [data, onChange],
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleLogoSelect = (logoId: string) => {
    setSelectedLogo(logoId)
    const logo = DEFAULT_LOGOS.find((l) => l.id === logoId)
    if (logo && logoId !== "custom" && logoId !== "upload" && logoId !== "created") {
      onChange({ ...data, logoUrl: logo.url })
      setLogoValidation({ status: "idle" })
    }
    if (logoId === "upload") {
      fileInputRef.current?.click()
    }
    if (logoId === "created") {
      setShowLogoCreator(true)
    }
  }

  const handleLogoCreated = useCallback(
    (dataUrl: string) => {
      setSelectedLogo("created")
      onChange({ ...data, logoUrl: dataUrl })
      setLogoValidation({
        status: "valid",
        message: "Logo created successfully!",
        dimensions: { width: 200, height: 60 },
      })
    },
    [data, onChange],
  )

  const getValidationDisplay = () => {
    switch (logoValidation.status) {
      case "loading":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          className: "text-muted-foreground",
          bgClassName: "bg-muted/50",
        }
      case "valid":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          className: "text-green-600",
          bgClassName: "bg-green-50 dark:bg-green-950/30",
        }
      case "warning":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          className: "text-amber-600",
          bgClassName: "bg-amber-50 dark:bg-amber-950/30",
        }
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          className: "text-red-500",
          bgClassName: "bg-red-50 dark:bg-red-950/30",
        }
      default:
        return null
    }
  }

  const validationDisplay = getValidationDisplay()

  const textFields: {
    key: keyof SignatureData
    label: string
    placeholder: string
    optional?: boolean
    icon: React.ReactNode
  }[] = [
    { key: "name", label: "Full Name", placeholder: "John Doe", icon: <User className="h-4 w-4" /> },
    { key: "title", label: "Job Title", placeholder: "Product Designer", icon: <Briefcase className="h-4 w-4" /> },
    {
      key: "company",
      label: "Company",
      placeholder: "Acme Inc.",
      optional: true,
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      key: "phone",
      label: "Phone",
      placeholder: "+1 (555) 123-4567",
      optional: true,
      icon: <Phone className="h-4 w-4" />,
    },
    {
      key: "twitter",
      label: "Twitter/X",
      placeholder: "@johndoe",
      optional: true,
      icon: <AtSign className="h-4 w-4" />,
    },
    {
      key: "website",
      label: "Website",
      placeholder: "https://yourcompany.com",
      optional: true,
      icon: <Globe className="h-4 w-4" />,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-3 animate-fade-up stagger-1">
        <label className="block text-sm font-semibold text-foreground">
          Logo <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_LOGOS.map((logo, index) => (
            <button
              key={logo.id}
              type="button"
              onClick={() => handleLogoSelect(logo.id)}
              className={`h-12 px-5 rounded-xl border-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] ${
                selectedLogo === logo.id
                  ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:shadow-sm"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {selectedLogo === logo.id && <Check className="h-4 w-4 animate-scale-in" />}
              {logo.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowLogoCreator(true)}
            className={`h-12 px-5 rounded-xl border-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] ${
              selectedLogo === "created"
                ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:shadow-sm"
            }`}
          >
            {selectedLogo === "created" && <Check className="h-4 w-4 animate-scale-in" />}
            <Wand2 className="h-4 w-4" />
            Create
          </button>
          <button
            type="button"
            onClick={() => handleLogoSelect("upload")}
            className={`h-12 px-5 rounded-xl border-2 text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] ${
              selectedLogo === "upload"
                ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:shadow-sm"
            }`}
          >
            {selectedLogo === "upload" && <Check className="h-4 w-4 animate-scale-in" />}
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={VALIDATION.ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
        {selectedLogo === "upload" && !data.logoUrl && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 animate-scale-in ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`p-4 rounded-full transition-colors duration-300 ${
                  isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <ImageIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isDragging ? "Drop your logo here" : "Click or drag to upload"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, SVG, GIF, WebP up to {VALIDATION.MAX_FILE_SIZE / 1024}KB
                </p>
              </div>
            </div>
          </div>
        )}
        {selectedLogo === "upload" && data.logoUrl && (
          <div className="space-y-2 animate-scale-in">
            {validationDisplay && logoValidation.message && (
              <div
                className={`flex items-start gap-2 px-3 py-2 rounded-xl text-sm ${validationDisplay.bgClassName} ${validationDisplay.className} animate-fade-up`}
              >
                <span className="mt-0.5 shrink-0">{validationDisplay.icon}</span>
                <span>{logoValidation.message}</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border animate-fade-up">
              <div className="w-16 h-12 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
                <img
                  src={data.logoUrl || "/placeholder.svg"}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Uploaded Logo</p>
                <p>Will appear at 40px height in signature</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange({ ...data, logoUrl: "" })
                  setLogoValidation({ status: "idle" })
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                aria-label="Remove uploaded logo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {selectedLogo === "custom" && (
          <div className="space-y-2 animate-scale-in">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={data.logoUrl}
                onChange={(e) => updateField("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
                className={`w-full h-14 pl-11 pr-12 rounded-2xl bg-card border-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 transition-all duration-300 text-base shadow-sm ${
                  logoValidation.status === "error"
                    ? "border-red-300 focus:border-red-400"
                    : logoValidation.status === "warning"
                      ? "border-amber-300 focus:border-amber-400"
                      : logoValidation.status === "valid"
                        ? "border-green-300 focus:border-green-400"
                        : "border-border focus:border-primary"
                }`}
              />
              {data.logoUrl && (
                <button
                  type="button"
                  onClick={() => clearField("logoUrl")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Clear Logo URL"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {validationDisplay && logoValidation.message && (
              <div
                className={`flex items-start gap-2 px-3 py-2 rounded-xl text-sm ${validationDisplay.bgClassName} ${validationDisplay.className} animate-fade-up`}
              >
                <span className="mt-0.5 shrink-0">{validationDisplay.icon}</span>
                <span>{logoValidation.message}</span>
              </div>
            )}
            {(logoValidation.status === "valid" || logoValidation.status === "warning") && data.logoUrl && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border animate-fade-up">
                <div className="w-16 h-12 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
                  <img
                    src={data.logoUrl || "/placeholder.svg"}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Preview</p>
                  <p>Will appear at 40px height in signature</p>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Tip: Use a PNG or SVG with transparent background. Max recommended size: {VALIDATION.MAX_LOGO_WIDTH}x
              {VALIDATION.MAX_LOGO_HEIGHT}px
            </p>
          </div>
        )}
        {selectedLogo === "created" && data.logoUrl && (
          <div className="space-y-2 animate-scale-in">
            {validationDisplay && logoValidation.message && (
              <div
                className={`flex items-start gap-2 px-3 py-2 rounded-xl text-sm ${validationDisplay.bgClassName} ${validationDisplay.className} animate-fade-up`}
              >
                <span className="mt-0.5 shrink-0">{validationDisplay.icon}</span>
                <span>{logoValidation.message}</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border animate-fade-up">
              <div className="w-16 h-12 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
                <img
                  src={data.logoUrl || "/placeholder.svg"}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Created Logo</p>
                <p>Will appear at 40px height in signature</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoCreator(true)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                aria-label="Edit created logo"
              >
                <Wand2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {textFields.map((field, index) => {
        const fieldError = getFieldError(field.key, data[field.key])
        const showError = touchedFields.has(field.key) && fieldError && !field.optional

        return (
          <div
            key={field.key}
            className="space-y-2 animate-fade-up"
            style={{ animationDelay: `${(index + 2) * 0.05}s` }}
          >
            <label className="block text-sm font-semibold text-foreground">
              {field.label}{" "}
              {field.optional ? (
                <span className="text-muted-foreground font-normal">(optional)</span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </label>
            <div className="relative group">
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  focusedField === field.key ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {field.icon}
              </div>
              <input
                type="text"
                value={data[field.key]}
                onChange={(e) => updateField(field.key, e.target.value)}
                onFocus={() => setFocusedField(field.key)}
                onBlur={() => handleFieldBlur(field.key)}
                placeholder={field.placeholder}
                className={`w-full h-14 pl-11 pr-12 rounded-2xl bg-card border-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 transition-all duration-300 text-base shadow-sm focus:shadow-md focus:scale-[1.01] ${
                  showError ? "border-red-300 focus:border-red-400" : "border-border focus:border-primary"
                }`}
              />
              {data[field.key] && (
                <button
                  type="button"
                  onClick={() => clearField(field.key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-accent transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Clear ${field.label}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {showError && (
              <p className="text-sm text-red-500 flex items-center gap-1.5 animate-fade-up">
                <AlertCircle className="h-3.5 w-3.5" />
                {fieldError}
              </p>
            )}
          </div>
        )
      })}

      <LogoCreatorModal
        open={showLogoCreator}
        onClose={() => setShowLogoCreator(false)}
        onLogoCreated={handleLogoCreated}
        companyName={data.company}
      />
    </div>
  )
}

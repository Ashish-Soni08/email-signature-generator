"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, Monitor, Smartphone } from "lucide-react"

interface HowToImportModalProps {
  open: boolean
  onClose: () => void
}

export function HowToImportModal({ open, onClose }: HowToImportModalProps) {
  const instructions = [
    {
      client: "Gmail",
      icon: <Mail className="h-5 w-5" />,
      color: "text-red-500 bg-red-500/10",
      steps: [
        "Open Gmail and click the gear icon → See all settings",
        "Scroll to 'Signature' section and create a new signature",
        "Click in the signature editor, then paste (Cmd/Ctrl + V)",
        "Click 'Save Changes' at the bottom",
      ],
    },
    {
      client: "macOS Mail",
      icon: <Monitor className="h-5 w-5" />,
      color: "text-blue-500 bg-blue-500/10",
      steps: [
        "Open Mail → Settings → Signatures",
        "Click + to create a new signature",
        "Uncheck 'Always match my default message font'",
        "Paste the signature (Cmd + V) into the preview area",
      ],
    },
    {
      client: "iOS Mail",
      icon: <Smartphone className="h-5 w-5" />,
      color: "text-green-500 bg-green-500/10",
      steps: [
        "Copy the signature HTML on your Mac",
        "Open Settings → Mail → Signature on your iPhone",
        "Long-press in the signature field and paste",
        "The HTML will render as your formatted signature",
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How to Import Your Signature</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {instructions.map(({ client, icon, color, steps }, sectionIndex) => (
            <div key={client} className="animate-fade-up" style={{ animationDelay: `${sectionIndex * 0.1}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
                <h3 className="font-bold text-lg text-foreground">{client}</h3>
              </div>
              <ol className="space-y-3 ml-1">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button
            onClick={onClose}
            className="w-full h-14 text-base font-semibold rounded-2xl hover:scale-[1.02] transition-transform"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

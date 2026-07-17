import { useState } from "react"
import { Copy, Check, Hash } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MedicalDocument } from "@/types/document"
import { formatLongDate } from "@/utils/dashboard"

interface DocumentHashDialogProps {
  document: MedicalDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentHashDialog({ document, open, onOpenChange }: DocumentHashDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!document) {
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document.documentHash)
      setCopied(true)
      toast.success("Hash copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar el hash.")
    }
  }

  const abbreviateHash = (hash: string) => {
    if (hash.length <= 10) return hash
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="size-5 text-slate-700" />
            <span>Hash técnico del documento</span>
          </DialogTitle>
          <DialogDescription>
            Representación criptográfica simulada para verificar la integridad en MediRecord.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</span>
              <p className="font-medium text-slate-800">{document.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identificador</span>
              <p className="font-mono text-xs text-slate-600">{document.id}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha de registro</span>
              <p className="text-slate-600">{formatLongDate(document.uploadedAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hash completo</span>
              <div className="flex items-start gap-2 mt-1">
                <code className="flex-1 block rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-xs text-slate-800 break-all">
                  {document.documentHash}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-9 w-9 shrink-0 border-slate-200 bg-white hover:bg-slate-50"
                  title="Copiar hash completo"
                >
                  {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4 text-slate-500" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hash abreviado</span>
              <p className="font-mono text-xs text-slate-600">{abbreviateHash(document.documentHash)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800">
                Simulado
              </Badge>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nota de demostración</span>
            </div>
            <p className="text-xs leading-5 text-slate-600">
              Este valor no fue calculado desde el contenido del PDF. El backend realizará ese proceso en la integración final.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

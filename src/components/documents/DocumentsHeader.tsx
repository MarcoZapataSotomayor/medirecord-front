import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DocumentsHeaderProps {
  onRegister: () => void
}

export function DocumentsHeader({ onRegister }: DocumentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Mis documentos</h1>
          <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800">
            Modo demostración
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Administra los documentos registrados bajo tu cuenta.
        </p>
        <p className="text-xs text-slate-400">
          Los archivos médicos permanecen fuera de blockchain.
        </p>
      </div>

      <Button
        onClick={onRegister}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95 w-full sm:w-auto"
      >
        <Plus className="size-4" />
        <span>Registrar documento</span>
      </Button>
    </div>
  )
}

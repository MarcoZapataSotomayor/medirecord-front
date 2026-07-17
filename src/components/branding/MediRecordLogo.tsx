import { ShieldPlus } from "lucide-react"

import { cn } from "@/lib/utils"

interface MediRecordLogoProps {
  compact?: boolean
  className?: string
  tone?: "light" | "dark"
}

export function MediRecordLogo({ compact = false, className, tone = "dark" }: MediRecordLogoProps) {
  const isLightTone = tone === "light"

  return (
    <div className={cn("inline-flex items-center gap-3", compact ? "gap-2" : "gap-3", className)}>
      <span className={cn("inline-flex size-10 items-center justify-center rounded-2xl shadow-sm", isLightTone ? "bg-white text-slate-900 shadow-black/10" : "bg-slate-900 text-white shadow-slate-900/10")}>
        <ShieldPlus className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={cn("font-heading font-semibold tracking-tight", isLightTone ? "text-white" : "text-slate-900", compact ? "text-base" : "text-lg")}>MediRecord</span>
        {!compact ? (
          <span className={cn("text-xs", isLightTone ? "text-slate-300" : "text-slate-500")}>Autorizaciones médicas con control del paciente</span>
        ) : null}
      </span>
    </div>
  )
}
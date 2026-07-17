import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RoleBadge } from "@/components/common/RoleBadge"
import type { User } from "@/types/user"
import { abbreviateWalletAddress } from "@/utils/wallet"
import {
  getParticipantScopeDescription,
  getParticipantStatusClassName,
  getParticipantStatusLabel,
} from "@/utils/participants"

interface ParticipantDetailsDialogProps {
  participant: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ParticipantDetailsDialog({ participant, open, onOpenChange }: ParticipantDetailsDialogProps) {
  if (!participant) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle del participante</DialogTitle>
          <DialogDescription>
            Información técnica de solo lectura para revisión administrativa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <DetailField label="ID técnico" value={participant.id} />
          <DetailField label="Nombre o razón social" value={participant.fullName} />
          <DetailField label="Wallet completa" value={participant.walletAddress} mono />
          <DetailField label="Wallet abreviada" value={abbreviateWalletAddress(participant.walletAddress)} mono />
          <DetailField label="Rol" value={<RoleBadge role={participant.role} />} />
          <DetailField
            label="Estado"
            value={<Badge variant="outline" className={getParticipantStatusClassName(participant.status)}>{getParticipantStatusLabel(participant.status)}</Badge>}
          />
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Alcance del rol</p>
          <p className="text-sm leading-6 text-slate-700">{getParticipantScopeDescription(participant.role)}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: ReactNode
  mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className={mono ? "font-mono text-sm text-slate-700" : "text-sm text-slate-700"}>{value}</div>
    </div>
  )
}

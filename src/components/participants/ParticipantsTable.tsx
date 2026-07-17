import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoleBadge } from "@/components/common/RoleBadge"
import { abbreviateWalletAddress } from "@/utils/wallet"
import {
  getParticipantStatusClassName,
  getParticipantStatusLabel,
} from "@/utils/participants"
import type { User } from "@/types/user"

interface ParticipantsTableProps {
  participants: readonly User[]
  onViewDetails: (participantId: string) => void
}

export function ParticipantsTable({ participants, onViewDetails }: ParticipantsTableProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-slate-950">Listado de participantes</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Consulta técnica sin información médica.</p>
        </div>
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
          <ArrowUpDown className="mr-1 size-3.5" aria-hidden="true" />
          Tabla ordenada por carga inicial
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre o razón social</TableHead>
                <TableHead>Cuenta digital</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => {
                const walletLabel = abbreviateWalletAddress(participant.walletAddress)

                return (
                  <TableRow key={participant.id}>
                    <TableCell className="max-w-[240px] whitespace-normal">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-950">{participant.fullName}</p>
                        <p className="text-xs text-slate-500">ID técnico: {participant.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <span title={participant.walletAddress} className="inline-block font-mono text-sm text-slate-700">
                        {walletLabel || participant.walletAddress}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={participant.role} />
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex flex-col gap-1">
                        <Badge variant="outline" className={getParticipantStatusClassName(participant.status)}>
                          {getParticipantStatusLabel(participant.status)}
                        </Badge>
                        <span className="text-xs text-slate-500">{participant.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => onViewDetails(participant.id)}>
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

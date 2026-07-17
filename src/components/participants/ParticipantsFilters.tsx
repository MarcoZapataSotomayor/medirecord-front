import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  ParticipantRoleFilter,
  ParticipantStatusFilter,
} from "@/utils/participants"

interface ParticipantsFiltersProps {
  search: string
  role: ParticipantRoleFilter
  status: ParticipantStatusFilter
  onSearchChange: (value: string) => void
  onRoleChange: (value: ParticipantRoleFilter) => void
  onStatusChange: (value: ParticipantStatusFilter) => void
  onClearFilters: () => void
}

const roleOptions: Array<{ value: ParticipantRoleFilter; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "ADMIN", label: "Administrador" },
  { value: "PATIENT", label: "Paciente" },
  { value: "DOCTOR", label: "Médico" },
  { value: "CLINIC", label: "Clínica" },
  { value: "INSURANCE", label: "Aseguradora" },
]

const statusOptions: Array<{ value: ParticipantStatusFilter; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
  { value: "SUSPENDED", label: "Suspendido" },
]

export function ParticipantsFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClearFilters,
}: ParticipantsFiltersProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.65fr))_auto] lg:items-end">
        <div className="space-y-2">
          <label htmlFor="participants-search" className="text-sm font-medium text-slate-700">
            Buscar por nombre o wallet
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="participants-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ej. María López o 0xB2c3..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="participants-role" className="text-sm font-medium text-slate-700">
            Filtrar por rol
          </label>
          <Select value={role} onValueChange={(value) => {
            if (
              value === "ALL" ||
              value === "ADMIN" ||
              value === "PATIENT" ||
              value === "DOCTOR" ||
              value === "CLINIC" ||
              value === "INSURANCE"
            ) {
              onRoleChange(value)
            }
          }}>
            <SelectTrigger id="participants-role" className="w-full bg-white">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="participants-status" className="text-sm font-medium text-slate-700">
            Filtrar por estado
          </label>
          <Select value={status} onValueChange={(value) => {
            if (value === "ALL" || value === "ACTIVE" || value === "INACTIVE" || value === "SUSPENDED") {
              onStatusChange(value)
            }
          }}>
            <SelectTrigger id="participants-status" className="w-full bg-white">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button type="button" variant="outline" onClick={onClearFilters} className="w-full lg:w-auto">
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

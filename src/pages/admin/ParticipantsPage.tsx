import { useMemo, useState } from "react"
import { toast } from "sonner"

import { ParticipantsEmptyState } from "@/components/participants/ParticipantsEmptyState"
import { ParticipantsFilters } from "@/components/participants/ParticipantsFilters"
import { ParticipantsHeader } from "@/components/participants/ParticipantsHeader"
import { ParticipantsStats } from "@/components/participants/ParticipantsStats"
import { ParticipantsTable } from "@/components/participants/ParticipantsTable"
import { ParticipantDetailsDialog } from "@/components/participants/ParticipantDetailsDialog"
import { RegisterParticipantDialog } from "@/components/participants/RegisterParticipantDialog"
import { useDemoParticipants } from "@/hooks/use-demo-participants"
import {
  filterParticipants,
  getParticipantStats,
  type ParticipantFilters,
  type ParticipantRegistrationInput,
} from "@/utils/participants"

const initialFilters: ParticipantFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
}

export function ParticipantsPage() {
  const {
    participants,
    registerParticipant,
    findParticipantById,
  } = useDemoParticipants()
  const [filters, setFilters] = useState<ParticipantFilters>(initialFilters)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)

  const stats = useMemo(() => getParticipantStats(participants), [participants])
  const filteredParticipants = useMemo(
    () => filterParticipants(participants, filters),
    [participants, filters],
  )
  const selectedParticipant = selectedParticipantId
    ? findParticipantById(selectedParticipantId) ?? null
    : null

  const handleRegister = (input: ParticipantRegistrationInput) => {
    const createdParticipant = registerParticipant(input)
    toast.success("Participante registrado en modo demostración.", {
      description:
        "En la integración final esta operación requerirá confirmación mediante MetaMask y Sepolia ETH.",
    })

    return createdParticipant
  }

  const handleClearFilters = () => setFilters(initialFilters)

  return (
    <div className="space-y-6">
      <ParticipantsHeader onRegister={() => setIsRegisterDialogOpen(true)} />

      <ParticipantsStats stats={stats} />

      <ParticipantsFilters
        search={filters.search}
        role={filters.role}
        status={filters.status}
        onSearchChange={(value) => setFilters((currentFilters) => ({ ...currentFilters, search: value }))}
        onRoleChange={(value) => setFilters((currentFilters) => ({ ...currentFilters, role: value }))}
        onStatusChange={(value) => setFilters((currentFilters) => ({ ...currentFilters, status: value }))}
        onClearFilters={handleClearFilters}
      />

      {participants.length === 0 ? (
        <ParticipantsEmptyState
          variant="empty"
          title="Aún no hay participantes"
          description="Registra la primera cuenta simulada para comenzar a revisar el panel administrativo."
          actionLabel="Registrar participante"
          onAction={() => setIsRegisterDialogOpen(true)}
        />
      ) : filteredParticipants.length === 0 ? (
        <ParticipantsEmptyState
          variant="filtered"
          title="No hay coincidencias"
          description="Prueba con otro nombre, wallet, rol o estado para encontrar participantes."
          actionLabel="Limpiar filtros"
          onAction={handleClearFilters}
        />
      ) : (
        <ParticipantsTable
          participants={filteredParticipants}
          onViewDetails={(participantId) => setSelectedParticipantId(participantId)}
        />
      )}

      <RegisterParticipantDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        onRegister={handleRegister}
        participants={participants}
      />

      <ParticipantDetailsDialog
        open={Boolean(selectedParticipant)}
        participant={selectedParticipant}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedParticipantId(null)
          }
        }}
      />
    </div>
  )
}

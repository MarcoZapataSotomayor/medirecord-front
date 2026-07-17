import type { User, UserRole, UserStatus } from "@/types/user"

export type ParticipantRoleFilter = UserRole | "ALL"
export type ParticipantStatusFilter = UserStatus | "ALL"

export interface ParticipantFilters {
  search: string
  role: ParticipantRoleFilter
  status: ParticipantStatusFilter
}

export interface ParticipantStats {
  total: number
  patients: number
  doctors: number
  institutions: number
}

export interface ParticipantRegistrationInput {
  fullName: string
  walletAddress: string
  role: Exclude<UserRole, "ADMIN">
}

const walletPattern = /^0x[a-fA-F0-9]{40}$/

export function normalizeWallet(walletAddress: string): string {
  return walletAddress.trim().toLowerCase()
}

export function isValidEthereumWallet(walletAddress: string): boolean {
  return walletPattern.test(walletAddress.trim())
}

export function hasDuplicateWallet(
  walletAddress: string,
  participants: readonly User[],
  excludedParticipantId?: string,
): boolean {
  const normalizedWallet = normalizeWallet(walletAddress)

  return participants.some((participant) => {
    if (excludedParticipantId && participant.id === excludedParticipantId) {
      return false
    }

    return normalizeWallet(participant.walletAddress) === normalizedWallet
  })
}

export function filterParticipants(
  participants: readonly User[],
  filters: ParticipantFilters,
): User[] {
  const searchTerm = filters.search.trim().toLowerCase()

  return participants.filter((participant) => {
    const matchesSearch =
      searchTerm.length === 0 ||
      participant.fullName.toLowerCase().includes(searchTerm) ||
      normalizeWallet(participant.walletAddress).includes(searchTerm)
    const matchesRole = filters.role === "ALL" || participant.role === filters.role
    const matchesStatus = filters.status === "ALL" || participant.status === filters.status

    return matchesSearch && matchesRole && matchesStatus
  })
}

export function getParticipantStats(participants: readonly User[]): ParticipantStats {
  return {
    total: participants.length,
    patients: participants.filter((participant) => participant.role === "PATIENT").length,
    doctors: participants.filter((participant) => participant.role === "DOCTOR").length,
    institutions: participants.filter(
      (participant) => participant.role === "CLINIC" || participant.role === "INSURANCE",
    ).length,
  }
}

export function getParticipantScopeDescription(role: UserRole): string {
  const scopeByRole: Record<UserRole, string> = {
    ADMIN: "Administra participantes y consulta información técnica. No recibe acceso médico por ser administrador.",
    PATIENT: "Administra sus documentos y emite autorizaciones.",
    DOCTOR: "Consulta documentos únicamente con autorización vigente.",
    CLINIC: "Consulta documentos autorizados para su cuenta institucional.",
    INSURANCE: "Realiza verificaciones dentro del alcance autorizado.",
  }

  return scopeByRole[role]
}

export function getParticipantRoleLabel(role: UserRole): string {
  const roleLabels: Record<UserRole, string> = {
    ADMIN: "Administrador",
    PATIENT: "Paciente",
    DOCTOR: "Médico",
    CLINIC: "Clínica",
    INSURANCE: "Aseguradora",
  }

  return roleLabels[role]
}

export function getParticipantStatusLabel(status: UserStatus): string {
  const statusLabels: Record<UserStatus, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    SUSPENDED: "Suspendido",
  }

  return statusLabels[status]
}

export function getParticipantStatusClassName(status: UserStatus): string {
  const statusClasses: Record<UserStatus, string> = {
    ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
    INACTIVE: "border-slate-200 bg-slate-100 text-slate-700",
    SUSPENDED: "border-amber-200 bg-amber-50 text-amber-900",
  }

  return statusClasses[status]
}

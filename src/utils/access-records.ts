import type { AccessRecord, AccessActionType } from "@/types/access-record"
import type { UserRole } from "@/types/user"

// Estas funciones de presentación y mapeo son para demostración en el frontend.
// La validación definitiva corresponderá al contrato Registry en blockchain y a las políticas del backend.
// El registro simulado no representa un evento real de Sepolia.

export function getActionTypeByRole(role: Extract<UserRole, "DOCTOR" | "CLINIC" | "INSURANCE">): AccessActionType {
  if (role === "DOCTOR") {
    return "MEDICAL_CONSULTATION"
  }
  if (role === "CLINIC") {
    return "INSTITUTIONAL_ACCESS"
  }
  if (role === "INSURANCE") {
    return "COVERAGE_VERIFICATION"
  }
  throw new Error(`Rol ${role} no tiene permitido registrar accesos directos.`)
}

export function getActionLabel(type: AccessActionType): string {
  switch (type) {
    case "MEDICAL_CONSULTATION":
      return "Consulta médica"
    case "INSTITUTIONAL_ACCESS":
      return "Acceso institucional"
    case "COVERAGE_VERIFICATION":
      return "Verificación de cobertura"
    default:
      return type
  }
}

export interface AccessRecordFilters {
  search: string
  actionType: AccessActionType | "ALL"
  result: "GRANTED" | "DENIED" | "ALL"
}

export function filterAndSortAccessRecords(
  records: readonly AccessRecord[],
  filters: AccessRecordFilters,
): AccessRecord[] {
  const q = filters.search.trim().toLowerCase()

  const filtered = records.filter((rec) => {
    const matchesSearch =
      q.length === 0 ||
      rec.documentName.toLowerCase().includes(q) ||
      rec.patientName.toLowerCase().includes(q) ||
      rec.actorName.toLowerCase().includes(q) ||
      rec.transactionHash.toLowerCase().includes(q)

    const matchesType = filters.actionType === "ALL" || rec.actionType === filters.actionType
    const matchesResult = filters.result === "ALL" || rec.result === filters.result

    return matchesSearch && matchesType && matchesResult
  })

  // Newest first by default
  return [...filtered].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
}

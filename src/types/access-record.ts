import type { UserRole } from "./user"

export type AccessActionType =
  | "MEDICAL_CONSULTATION"
  | "INSTITUTIONAL_ACCESS"
  | "COVERAGE_VERIFICATION"

export type AccessResult = "GRANTED" | "DENIED"

export interface AccessRecord {
  id: string
  permissionId: string
  documentId: string
  documentName: string
  patientId: string
  patientName: string
  actorId: string
  actorName: string
  actorWallet: string
  actorRole: Extract<UserRole, "DOCTOR" | "CLINIC" | "INSURANCE">
  actionType: AccessActionType
  occurredAt: string
  result: AccessResult
  transactionHash: string
  blockNumber: number
  gasUsed: string
}

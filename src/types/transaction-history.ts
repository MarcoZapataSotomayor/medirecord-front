import type { UserRole } from "./user"
import type { TransactionStatus } from "./transaction"

export type OperationType =
  | "PERMISSION_ISSUED"
  | "PERMISSION_REVOKED"
  | "MEDICAL_CONSULTATION_REGISTERED"
  | "INSTITUTIONAL_ACCESS_REGISTERED"
  | "COVERAGE_VERIFICATION_REGISTERED"

export interface TransactionHistoryEntry {
  id: string
  actorId: string
  actorName: string
  actorRole: UserRole
  operationType: OperationType
  operationLabel: string
  relatedDocumentId?: string
  relatedPermissionId?: string
  transactionHash: string
  blockNumber: number
  gasUsed: string
  status: TransactionStatus
  occurredAt: string
  simulated: boolean
}

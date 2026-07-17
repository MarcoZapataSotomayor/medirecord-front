import type { UserRole } from "./user"

export type PermissionStatus = "ACTIVE" | "EXPIRED" | "REVOKED"

export type AccessType = "READ" | "WRITE"

export type PermissionRecipientRole = Extract<
  UserRole,
  "DOCTOR" | "CLINIC" | "INSURANCE"
>

export interface Permission {
  id: string
  tokenId: string
  documentId: string
  documentName: string
  patientId: string
  patientName: string
  authorizedUserId: string
  authorizedUserName: string
  authorizedWallet: string
  authorizedRole: PermissionRecipientRole
  accessType: AccessType
  issuedAt: string
  expiresAt: string
  status: PermissionStatus
  transactionHash: string
}
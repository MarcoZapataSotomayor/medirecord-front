export type UserRole =
  | "ADMIN"
  | "PATIENT"
  | "DOCTOR"
  | "CLINIC"
  | "INSURANCE"

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface User {
  id: string
  fullName: string
  role: UserRole
  walletAddress: string
  status: UserStatus
}

export interface RoleCapabilities {
  canRegisterUsers: boolean
  canViewUsers: boolean
  canUploadDocuments: boolean
  canViewOwnDocuments: boolean
  canViewAuthorizedDocuments: boolean
  canIssuePermissions: boolean
  canRevokeOwnPermissions: boolean
  canViewIssuedPermissions: boolean
  canViewReceivedPermissions: boolean
  canRegisterConsultation: boolean
  canViewActivity: boolean
}
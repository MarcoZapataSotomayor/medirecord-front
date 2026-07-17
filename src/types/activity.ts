import type { UserRole } from "./user"

export type ActivityType =
  | "USER_REGISTERED"
  | "DOCUMENT_REGISTERED"
  | "PERMISSION_ISSUED"
  | "PERMISSION_REVOKED"
  | "PERMISSION_EXPIRED"
  | "DOCUMENT_ACCESSED"
  | "CONSULTATION_REGISTERED"

export type ActivityStatus = "SUCCESS" | "WARNING" | "INFO"

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  occurredAt: string
  actorId: string
  actorName: string
  relatedUserId?: string
  documentId?: string
  permissionId?: string
  status?: ActivityStatus
  visibleToRoles?: UserRole[]
}
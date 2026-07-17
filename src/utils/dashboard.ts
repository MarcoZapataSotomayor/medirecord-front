import type { Activity } from "@/types/activity"
import type { MedicalDocument } from "@/types/document"
import type { Permission, PermissionStatus } from "@/types/permission"
import type { User, UserRole } from "@/types/user"
import { getEffectivePermissionStatus } from "@/utils/permissions"

export interface DashboardMetrics {
  first: number
  second: number
  third: number
  fourth: number
}

export interface DashboardDataSet {
  documents: MedicalDocument[]
  permissions: Permission[]
  activities: Activity[]
  activePermissions: Permission[]
  expiredPermissions: Permission[]
  revokedPermissions: Permission[]
}

function isRelevantActivityForRole(activity: Activity, role: UserRole, currentUserId: string): boolean {
  if (role === "ADMIN") {
    return true
  }

  if (role === "PATIENT") {
    return [activity.actorId, activity.relatedUserId].includes(currentUserId)
  }

  return [activity.actorId, activity.relatedUserId].includes(currentUserId)
}

export function getVisibleDocuments(
  documents: readonly MedicalDocument[],
  currentUser: User,
  permissions: readonly Permission[],
): MedicalDocument[] {
  // El filtrado visual no reemplaza las validaciones del backend ni de blockchain.
  if (currentUser.role === "ADMIN") {
    return [...documents]
  }

  if (currentUser.role === "PATIENT") {
    return documents.filter((document) => document.ownerId === currentUser.id)
  }

  const authorizedDocumentIds = new Set(
    permissions
      .filter((permission) =>
        permission.authorizedUserId === currentUser.id && getEffectivePermissionStatus(permission) === "ACTIVE",
      )
      .map((permission) => permission.documentId),
  )

  return documents.filter((document) => authorizedDocumentIds.has(document.id))
}

export function getPatientIssuedPermissions(
  permissions: readonly Permission[],
  patientId: string,
): Permission[] {
  return permissions.filter((permission) => permission.patientId === patientId)
}

export function getReceivedPermissions(
  permissions: readonly Permission[],
  userId: string,
): Permission[] {
  return permissions.filter((permission) => permission.authorizedUserId === userId)
}

export function getActivePermissions(permissions: readonly Permission[]): Permission[] {
  return permissions.filter((permission) => getEffectivePermissionStatus(permission) === "ACTIVE")
}

export function getExpiredPermissions(permissions: readonly Permission[]): Permission[] {
  return permissions.filter((permission) => getEffectivePermissionStatus(permission) === "EXPIRED")
}

export function getRevokedPermissions(permissions: readonly Permission[]): Permission[] {
  return permissions.filter((permission) => getEffectivePermissionStatus(permission) === "REVOKED")
}

export function getVisibleActivities(
  activities: readonly Activity[],
  role: UserRole,
  currentUserId: string,
): Activity[] {
  return activities.filter((activity) =>
    !activity.visibleToRoles || activity.visibleToRoles.includes(role)
      ? isRelevantActivityForRole(activity, role, currentUserId)
      : false,
  )
}

export function getDashboardMetrics(
  role: UserRole,
  documents: readonly MedicalDocument[],
  permissions: readonly Permission[],
  activities: readonly Activity[],
  currentUserId: string,
): DashboardMetrics {
  const activePermissions = getActivePermissions(permissions)
  const expiredPermissions = getExpiredPermissions(permissions)
  const revokedPermissions = getRevokedPermissions(permissions)
  const documentCount = role === "ADMIN"
    ? documents.length
    : role === "PATIENT"
      ? documents.filter((document) => document.ownerId === currentUserId).length
      : documents.filter((document) =>
          activePermissions.some(
            (permission) =>
              permission.authorizedUserId === currentUserId && permission.documentId === document.id,
          ),
        ).length

  const permissionCount = role === "ADMIN"
    ? permissions.length
    : role === "PATIENT"
      ? permissions.filter((permission) => permission.patientId === currentUserId).length
      : permissions.filter((permission) => permission.authorizedUserId === currentUserId).length

  const recentActivityCount = role === "ADMIN"
    ? activities.length
    : getVisibleActivities(activities, role, currentUserId).length

  return {
    first: role === "ADMIN" ? 0 : documentCount,
    second: role === "ADMIN" ? permissions.length : permissionCount,
    third: role === "ADMIN" ? activePermissions.length : expiredPermissions.length,
    fourth: role === "ADMIN" ? recentActivityCount : revokedPermissions.length,
  }
}

export function getEffectiveStatusLabel(status: PermissionStatus): string {
  const labels: Record<PermissionStatus, string> = {
    ACTIVE: "Activo",
    EXPIRED: "Expirado",
    REVOKED: "Revocado",
  }

  return labels[status]
}

export function getActivityStatusLabel(status: Activity["status"]): string {
  const labels: Record<NonNullable<Activity["status"]>, string> = {
    SUCCESS: "Registrado",
    WARNING: "Pendiente",
    INFO: "Informativo",
  }

  return status ? labels[status] : "Registrado"
}

export function formatLongDate(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return "sin fecha"
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate)
}

export function formatRelativeDate(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible"
  }

  const diffInMinutes = Math.round((Date.now() - parsedDate.getTime()) / 60000)

  if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes <= 1 ? "Hace un minuto" : `Hace ${Math.abs(diffInMinutes)} minutos`
  }

  const diffInHours = Math.round(diffInMinutes / 60)

  if (Math.abs(diffInHours) < 24) {
    return diffInHours <= 1 ? "Hace 1 hora" : `Hace ${Math.abs(diffInHours)} horas`
  }

  return formatLongDate(value)
}

export function formatExpiryLabel(value: string): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return "sin fecha de expiración"
  }

  const diffInDays = Math.round((parsedDate.getTime() - Date.now()) / 86400000)

  if (diffInDays === 0) {
    return "Expira hoy"
  }

  if (diffInDays > 0) {
    return diffInDays === 1 ? "Expira en 1 día" : `Expira en ${diffInDays} días`
  }

  const expiredDays = Math.abs(diffInDays)

  return expiredDays === 1 ? "Expiró hace 1 día" : `Expiró hace ${expiredDays} días`
}

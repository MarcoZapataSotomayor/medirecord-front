import { useMemo } from "react"
import {
  Activity,
  FileClock,
  FileText,
  Files,
  FileCheck2,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome"
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard"
import { QuickActionCard } from "@/components/dashboard/QuickActionCard"
import { RecentActivityList } from "@/components/dashboard/RecentActivityList"
import { PermissionSummary } from "@/components/dashboard/PermissionSummary"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoParticipants } from "@/hooks/use-demo-participants"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoAccessRecords } from "@/hooks/use-demo-access-records"
import { DASHBOARD_CONFIG } from "@/config/dashboard-config"
import { demoActivities } from "@/mocks/activities"
import { demoDocuments } from "@/mocks/documents"
import { demoPermissions } from "@/mocks/permissions"
import { demoUsers } from "@/mocks/users"
import {
  formatLongDate,
  getActivePermissions,
  getExpiredPermissions,
  getPatientIssuedPermissions,
  getReceivedPermissions,
  getRevokedPermissions,
  getVisibleActivities,
  getVisibleDocuments,
} from "@/utils/dashboard"
import { getEffectivePermissionStatus } from "@/utils/permissions"
import type { Activity as ActivityItem } from "@/types/activity"
import type { MedicalDocument } from "@/types/document"
import type { Permission } from "@/types/permission"
import type { UserRole } from "@/types/user"

type MetricCard = {
  title: string
  value: string
  description: string
  icon: typeof Users
  secondaryText?: string
  variant?: "default" | "success" | "warning" | "danger"
}

export function DashboardHomePage() {
  const { currentUser } = useDemoSession()
  const { participants } = useDemoParticipants()
  const { documents } = useDemoDocuments()
  const { permissions } = useDemoPermissions()
  const { accessRecords } = useDemoAccessRecords()
  const currentUserId = currentUser.id
  const currentUserRole = currentUser.role
  const roleConfig = DASHBOARD_CONFIG[currentUserRole]
  const totalParticipants = participants.length
  const totalDocuments = documents.length
  const totalPermissions = permissions.length

  const data = useMemo(() => {
    const visibleDocuments = getVisibleDocuments(documents, currentUser, permissions)
    const issuedPermissions = getPatientIssuedPermissions(permissions, currentUserId)
    const receivedPermissions = getReceivedPermissions(permissions, currentUserId)
    const activePermissions = getActivePermissions(permissions)
    const expiredPermissions = getExpiredPermissions(permissions)
    const revokedPermissions = getRevokedPermissions(permissions)

    // Map dynamic access records to Activity items
    const mappedAccessActivities: ActivityItem[] = accessRecords.map((rec) => {
      const type: ActivityItem["type"] = rec.actionType === "MEDICAL_CONSULTATION"
        ? "CONSULTATION_REGISTERED"
        : "DOCUMENT_ACCESSED"

      return {
        id: rec.id,
        type,
        title: rec.actionType === "MEDICAL_CONSULTATION"
          ? "Consulta registrada"
          : rec.actionType === "INSTITUTIONAL_ACCESS"
            ? "Acceso institucional"
            : "Verificación registrada",
        description: `${rec.actorName} accedió a "${rec.documentName}" de ${rec.patientName}`,
        occurredAt: rec.occurredAt,
        actorId: rec.actorId,
        actorName: rec.actorName,
        relatedUserId: rec.patientId,
        documentId: rec.documentId,
        permissionId: rec.permissionId,
        status: "SUCCESS"
      }
    })

    const allActivities = [...demoActivities, ...mappedAccessActivities]
    const visibleActivities = getVisibleActivities(allActivities, currentUserRole, currentUserId)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())

    return {
      visibleDocuments,
      issuedPermissions,
      receivedPermissions,
      activePermissions,
      expiredPermissions,
      revokedPermissions,
      visibleActivities,
    }
  }, [currentUser, currentUserId, currentUserRole, documents, permissions, accessRecords])

  const metrics = useMemo(
    () => buildMetricCards(currentUserRole, currentUserId, totalParticipants, totalDocuments, totalPermissions, accessRecords.length, data),
    [currentUserId, currentUserRole, data, totalParticipants, totalDocuments, totalPermissions, accessRecords.length],
  )

  const permissionsForSummary = useMemo(
    () => buildPermissionSummary(currentUserRole, currentUserId, permissions),
    [currentUserId, currentUserRole, permissions],
  )

  return (
    <div className="space-y-6">
      <DashboardWelcome
        user={currentUser}
        description={roleConfig.welcomeDescription}
        privacyNotice={roleConfig.privacyNotice}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <DashboardStatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
            secondaryText={metric.secondaryText}
            variant={metric.variant}
          />
        ))}
      </section>

      <QuickActionCard
        title="Acciones rápidas"
        description="Las acciones visibles se adaptan al rol activo y se habilitarán en bloques posteriores."
        actions={roleConfig.quickActions}
        currentRole={currentUserRole}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <RecentActivityList
          title="Actividad reciente"
          description={roleConfig.activityScope === "admin" ? "Revisión administrativa y técnica global" : roleConfig.activityScope === "patient" ? "Actividad vinculada con tus documentos y permisos" : "Actividad vinculada con autorizaciones y accesos permitidos"}
          activities={data.visibleActivities.slice(0, 6)}
          resolveRelatedLabel={resolveRelatedLabel}
        />

        <PermissionSummary role={currentUser.role} permissions={permissionsForSummary} />
      </section>

      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Resumen de privacidad y alcance</CardTitle>
          <CardDescription className="text-muted-foreground">
            La interfaz de demostración solo resume información técnica y de autorización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">{roleConfig.privacyNotice}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function buildMetricCards(
  role: UserRole,
  currentUserId: string,
  totalParticipants: number,
  totalDocuments: number,
  totalPermissions: number,
  totalAccessRecords: number,
  data: {
    visibleDocuments: readonly MedicalDocument[]
    issuedPermissions: readonly Permission[]
    receivedPermissions: readonly Permission[]
    activePermissions: readonly Permission[]
    visibleActivities: readonly ActivityItem[]
  },
): MetricCard[] {
  const dateLabel = formatLongDate(new Date().toISOString())
  const ownPermissions = role === "PATIENT" ? data.issuedPermissions : role === "ADMIN" ? data.receivedPermissions.concat(data.issuedPermissions) : data.receivedPermissions
  const activeOwnPermissions = ownPermissions.filter((permission) => getEffectivePermissionStatus(permission) === "ACTIVE")
  const expiredOwnPermissions = ownPermissions.filter((permission) => getEffectivePermissionStatus(permission) === "EXPIRED")
  const revokedOwnPermissions = ownPermissions.filter((permission) => getEffectivePermissionStatus(permission) === "REVOKED")
  const recentConsultations = data.visibleActivities.filter((activity) => activity.type === "CONSULTATION_REGISTERED")

  switch (role) {
    case "ADMIN":
      return [
        {
          title: "Participantes registrados",
          value: String(totalParticipants),
          description: "Cuentas simuladas disponibles para la capa administrativa.",
          icon: Users,
          secondaryText: dateLabel,
        },
        {
          title: "Documentos técnicos",
          value: String(totalDocuments),
          description: "Documentos de soporte y referencia para la capa administrativa.",
          icon: Files,
          secondaryText: "Sin PDFs en blockchain",
        },
        {
          title: "Permisos emitidos",
          value: String(totalPermissions),
          description: "Autorizaciones de demostración disponibles para trazabilidad.",
          icon: ShieldCheck,
          secondaryText: `${data.activePermissions.length} activos`,
          variant: "success",
        },
        {
          title: "Actividad reciente",
          value: String(data.visibleActivities.length),
          description: "Eventos administrativos y técnicos visibles en la sesión actual.",
          icon: Activity,
          secondaryText: "Vista global",
          variant: "warning",
        },
      ]
    case "PATIENT":
      return [
        {
          title: "Mis documentos",
          value: String(data.visibleDocuments.filter((document) => document.ownerId === currentUserId).length),
          description: "Solo documentos cuyo titular coincide con tu cuenta.",
          icon: FileText,
          secondaryText: `${data.visibleDocuments.length} documentos visibles`,
        },
        {
          title: "Permisos activos",
          value: String(activeOwnPermissions.length),
          description: "Autorizaciones vigentes emitidas por esta cuenta.",
          icon: ShieldCheck,
          secondaryText: `${data.issuedPermissions.length} emitidos`,
          variant: "success",
        },
        {
          title: "Permisos revocados",
          value: String(revokedOwnPermissions.length),
          description: "Autorizaciones que ya no están vigentes.",
          icon: FileClock,
          secondaryText: `${expiredOwnPermissions.length} expirados`,
          variant: "danger",
        },
        {
          title: "Consultas recientes",
          value: String(recentConsultations.length),
          description: "Consultas simuladas relacionadas con tus documentos y permisos.",
          icon: Stethoscope,
          secondaryText: "Actividad asociada",
          variant: "warning",
        },
      ]
    case "DOCTOR":
      return [
        {
          title: "Documentos disponibles",
          value: String(data.visibleDocuments.length),
          description: "Documentos compartidos mediante autorizaciones vigentes.",
          icon: Files,
          secondaryText: "Accesos permitidos",
        },
        {
          title: "Permisos vigentes",
          value: String(activeOwnPermissions.length),
          description: "Autorizaciones activas para consulta clínica.",
          icon: ShieldCheck,
          secondaryText: `${data.receivedPermissions.length} recibidos`,
          variant: "success",
        },
        {
          title: "Permisos próximos a vencer o expirados",
          value: String(expiredOwnPermissions.length),
          description: "Permisos que requieren revisión o ya vencieron.",
          icon: FileClock,
          secondaryText: `${revokedOwnPermissions.length} revocados`,
          variant: "warning",
        },
        {
          title: "Consultas registradas",
          value: String(totalAccessRecords),
          description: "Registro de consultas simuladas desde la cuenta activa.",
          icon: Stethoscope,
          secondaryText: "Trazabilidad permitida",
          variant: "warning",
        },
      ]
    case "CLINIC":
      return [
        {
          title: "Documentos autorizados",
          value: String(data.visibleDocuments.length),
          description: "Documentos compartidos con la institución activa.",
          icon: Files,
          secondaryText: "Acceso institucional",
        },
        {
          title: "Permisos vigentes",
          value: String(activeOwnPermissions.length),
          description: "Autorizaciones activas para revisión institucional.",
          icon: FileCheck2,
          secondaryText: `${data.receivedPermissions.length} recibidos`,
          variant: "success",
        },
        {
          title: "Permisos expirados",
          value: String(expiredOwnPermissions.length),
          description: "Credenciales que ya superaron su fecha de vigencia.",
          icon: FileClock,
          secondaryText: `${revokedOwnPermissions.length} revocados`,
          variant: "warning",
        },
        {
          title: "Actividad institucional",
          value: String(totalAccessRecords),
          description: "Eventos vinculados con accesos e historial permitido.",
          icon: Activity,
          secondaryText: "Solo alcance autorizado",
        },
      ]
    case "INSURANCE":
      return [
        {
          title: "Documentos autorizados",
          value: String(data.visibleDocuments.length),
          description: "Documentos disponibles para la entidad aseguradora.",
          icon: Files,
          secondaryText: "Verificación técnica",
        },
        {
          title: "Verificaciones vigentes",
          value: String(activeOwnPermissions.length),
          description: "Autorizaciones válidas para procesos de validación.",
          icon: ShieldCheck,
          secondaryText: `${data.receivedPermissions.length} permisos recibidos`,
          variant: "success",
        },
        {
          title: "Permisos expirados",
          value: String(expiredOwnPermissions.length),
          description: "Autorizaciones que ya no pueden usarse.",
          icon: FileClock,
          secondaryText: `${revokedOwnPermissions.length} revocados`,
          variant: "danger",
        },
        {
          title: "Actividad reciente",
          value: String(totalAccessRecords),
          description: "Consultas y validaciones visibles para esta entidad.",
          icon: Activity,
          secondaryText: "Trazabilidad permitida",
          variant: "warning",
        },
      ]
  }
}

function buildPermissionSummary(
  role: UserRole,
  currentUserId: string,
  permissions: readonly Permission[],
): Permission[] {
  const sortedPermissions = [...permissions].sort(
    (left, right) => new Date(right.issuedAt).getTime() - new Date(left.issuedAt).getTime(),
  )

  if (role === "PATIENT") {
    return getPatientIssuedPermissions(sortedPermissions, currentUserId).slice(0, 4)
  }

  if (role === "ADMIN") {
    return sortedPermissions.slice(0, 4)
  }

  return getReceivedPermissions(sortedPermissions, currentUserId).slice(0, 4)
}

function resolveRelatedLabel(activity: ActivityItem): string | undefined {
  if (activity.permissionId) {
    const permission = demoPermissions.find((item) => item.id === activity.permissionId)

    if (permission) {
      return `Credencial #${permission.tokenId}`
    }
  }

  if (activity.documentId) {
    const document = demoDocuments.find((item) => item.id === activity.documentId)

    if (document) {
      return document.name
    }
  }

  if (activity.relatedUserId) {
    const relatedUser = demoUsers.find((item) => item.id === activity.relatedUserId)

    if (relatedUser) {
      return relatedUser.fullName
    }
  }

  return undefined
}
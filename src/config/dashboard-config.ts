import {
  Activity,
  FileCheck2,
  FileClock,
  FilePlus,
  Files,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  Users,
  UserRound,
  FileSearch,
  BriefcaseMedical,
  ClipboardCheck,
} from "lucide-react"

import type { UserRole } from "@/types/user"

export interface DashboardMetricDefinition {
  label: string
  icon: typeof LayoutDashboard
  description: string
}

export interface QuickActionDefinition {
  id: string
  title: string
  description: string
  icon: typeof LayoutDashboard
  allowedRoles: UserRole[]
  enabled: boolean
  futureRoute?: string
  badge?: string
}

export interface DashboardRoleConfig {
  title: string
  description: string
  welcomeDescription: string
  privacyNotice: string
  metricDefinitions: DashboardMetricDefinition[]
  quickActions: QuickActionDefinition[]
  activityScope: string
}

const futureBadge = "Próximamente"

export const DASHBOARD_CONFIG: Record<UserRole, DashboardRoleConfig> = {
  ADMIN: {
    title: "Panel administrativo",
    description: "Vista técnica para revisar participantes, permisos y actividad.",
    welcomeDescription:
      "Este panel concentra la información técnica y administrativa disponible para la cuenta de demostración.",
    privacyNotice:
      "Los datos clínicos permanecen fuera de blockchain. Este panel muestra únicamente información técnica y administrativa.",
    metricDefinitions: [
      { label: "Participantes registrados", icon: Users, description: "Cuentas simuladas disponibles." },
      { label: "Documentos técnicos", icon: Files, description: "Documentos administrativos y de prueba." },
      { label: "Permisos emitidos", icon: ShieldCheck, description: "Autorizaciones técnicas emitidas." },
      { label: "Actividad reciente", icon: Activity, description: "Eventos administrativos y técnicos." },
    ],
    quickActions: [
      { id: "register-participant", title: "Registrar participante", description: "Preparar el alta de una cuenta técnica.", icon: Users, allowedRoles: ["ADMIN"], enabled: false, futureRoute: "/app/participants", badge: futureBadge },
      { id: "review-participants", title: "Consultar participantes", description: "Revisar el listado de cuentas disponibles.", icon: UserRound, allowedRoles: ["ADMIN"], enabled: false, futureRoute: "/app/participants", badge: futureBadge },
      { id: "review-documents", title: "Revisar documentos técnicos", description: "Consultar documentos de soporte técnico.", icon: Files, allowedRoles: ["ADMIN"], enabled: false, futureRoute: "/app/documents", badge: futureBadge },
      { id: "review-activity", title: "Consultar actividad", description: "Ver trazabilidad administrativa y técnica.", icon: Activity, allowedRoles: ["ADMIN"], enabled: false, futureRoute: "/app/activity", badge: futureBadge },
    ],
    activityScope: "admin",
  },
  PATIENT: {
    title: "Panel del paciente",
    description: "Espacio personal para documentos y autorizaciones.",
    welcomeDescription:
      "Aquí verás tus documentos, tus autorizaciones y la actividad relacionada con tu cuenta.",
    privacyNotice: "Tú controlas quién puede consultar tus documentos y durante cuánto tiempo.",
    metricDefinitions: [
      { label: "Mis documentos", icon: Files, description: "Documentos pertenecientes a tu cuenta." },
      { label: "Permisos activos", icon: ShieldCheck, description: "Autorizaciones vigentes emitidas por ti." },
      { label: "Permisos revocados", icon: FileClock, description: "Autorizaciones ya revocadas o expiradas." },
      { label: "Consultas recientes", icon: Activity, description: "Actividad asociada a tus documentos." },
    ],
    quickActions: [
      { id: "upload-document", title: "Subir documento", description: "Preparar la carga de un documento personal.", icon: FilePlus, allowedRoles: ["PATIENT"], enabled: false, futureRoute: "/app/documents/upload", badge: futureBadge },
      { id: "share-document", title: "Compartir documento", description: "Crear una autorización para terceros.", icon: ShieldCheck, allowedRoles: ["PATIENT"], enabled: false, futureRoute: "/app/permissions/new", badge: futureBadge },
      { id: "review-authorizations", title: "Revisar autorizaciones", description: "Consultar permisos emitidos.", icon: FileCheck2, allowedRoles: ["PATIENT"], enabled: false, futureRoute: "/app/permissions", badge: futureBadge },
      { id: "review-history", title: "Ver historial", description: "Revisar actividad asociada a tu cuenta.", icon: FileClock, allowedRoles: ["PATIENT"], enabled: false, futureRoute: "/app/activity", badge: futureBadge },
    ],
    activityScope: "patient",
  },
  DOCTOR: {
    title: "Panel clínico",
    description: "Consulta documentos compartidos y permisos recibidos.",
    welcomeDescription:
      "Esta vista centraliza los documentos autorizados y la trazabilidad clínica permitida.",
    privacyNotice: "Solo puedes consultar documentos asociados a autorizaciones vigentes.",
    metricDefinitions: [
      { label: "Documentos disponibles", icon: Files, description: "Accesos compartidos con tu cuenta." },
      { label: "Permisos vigentes", icon: ShieldCheck, description: "Autorizaciones activas para consulta." },
      { label: "Próximos a vencer", icon: FileClock, description: "Permisos que requieren atención." },
      { label: "Consultas registradas", icon: Stethoscope, description: "Actividad simulada del panel." },
    ],
    quickActions: [
      { id: "view-shared-documents", title: "Ver documentos compartidos", description: "Consultar documentos autorizados.", icon: Files, allowedRoles: ["DOCTOR"], enabled: false, futureRoute: "/app/shared-documents", badge: futureBadge },
      { id: "review-received-permissions", title: "Revisar autorizaciones", description: "Analizar permisos recibidos.", icon: ShieldCheck, allowedRoles: ["DOCTOR"], enabled: false, futureRoute: "/app/permissions/received", badge: futureBadge },
      { id: "register-consultation", title: "Registrar consulta", description: "Preparar el registro de una atención.", icon: Stethoscope, allowedRoles: ["DOCTOR"], enabled: false, futureRoute: "/app/consultations/new", badge: futureBadge },
      { id: "view-history", title: "Ver historial", description: "Consultar trazabilidad clínica permitida.", icon: FileClock, allowedRoles: ["DOCTOR"], enabled: false, futureRoute: "/app/activity", badge: futureBadge },
    ],
    activityScope: "authorized",
  },
  CLINIC: {
    title: "Panel institucional",
    description: "Consulta autorizaciones institucionales y actividad permitida.",
    welcomeDescription:
      "Esta vista organiza los documentos autorizados y los permisos vigentes de la entidad.",
    privacyNotice: "El acceso institucional depende de autorizaciones emitidas por los pacientes.",
    metricDefinitions: [
      { label: "Documentos autorizados", icon: Files, description: "Documentos compartidos con la clínica." },
      { label: "Permisos vigentes", icon: FileCheck2, description: "Autorizaciones actualmente activas." },
      { label: "Permisos expirados", icon: FileClock, description: "Autorizaciones ya vencidas." },
      { label: "Actividad institucional", icon: Activity, description: "Eventos del flujo permitido." },
    ],
    quickActions: [
      { id: "review-authorized-documents", title: "Ver documentos autorizados", description: "Consultar referencias compartidas.", icon: Files, allowedRoles: ["CLINIC"], enabled: false, futureRoute: "/app/authorized-documents", badge: futureBadge },
      { id: "review-institutional-permissions", title: "Revisar permisos", description: "Ver autorizaciones institucionales.", icon: FileCheck2, allowedRoles: ["CLINIC"], enabled: false, futureRoute: "/app/permissions", badge: futureBadge },
      { id: "consult-history", title: "Consultar historial", description: "Revisar actividad permitida de la entidad.", icon: FileClock, allowedRoles: ["CLINIC"], enabled: false, futureRoute: "/app/activity", badge: futureBadge },
      { id: "institution-profile", title: "Ver perfil institucional", description: "Visualizar la ficha de la entidad.", icon: BriefcaseMedical, allowedRoles: ["CLINIC"], enabled: false, futureRoute: "/app/profile", badge: futureBadge },
    ],
    activityScope: "authorized",
  },
  INSURANCE: {
    title: "Panel de aseguradora",
    description: "Verificación de documentos y autorizaciones concedidas.",
    welcomeDescription:
      "Esta vista muestra documentos autorizados y el historial de validaciones de la entidad.",
    privacyNotice: "Las verificaciones se limitan a las autorizaciones concedidas para tu entidad.",
    metricDefinitions: [
      { label: "Documentos autorizados", icon: Files, description: "Documentos compartidos para verificación." },
      { label: "Verificaciones vigentes", icon: ClipboardCheck, description: "Autorizaciones activas para validar." },
      { label: "Permisos expirados", icon: FileClock, description: "Autorizaciones ya vencidas." },
      { label: "Actividad reciente", icon: Activity, description: "Validaciones y consultas simuladas." },
    ],
    quickActions: [
      { id: "review-documents", title: "Ver documentos autorizados", description: "Consultar documentos permitidos.", icon: Files, allowedRoles: ["INSURANCE"], enabled: false, futureRoute: "/app/authorized-documents", badge: futureBadge },
      { id: "verify-permissions", title: "Verificar autorizaciones", description: "Preparar la revisión de permisos.", icon: FileSearch, allowedRoles: ["INSURANCE"], enabled: false, futureRoute: "/app/verifications", badge: futureBadge },
      { id: "review-history", title: "Revisar historial", description: "Consultar validaciones previas.", icon: FileClock, allowedRoles: ["INSURANCE"], enabled: false, futureRoute: "/app/activity", badge: futureBadge },
      { id: "institution-profile", title: "Ver perfil institucional", description: "Visualizar la ficha de la entidad.", icon: BriefcaseMedical, allowedRoles: ["INSURANCE"], enabled: false, futureRoute: "/app/profile", badge: futureBadge },
    ],
    activityScope: "authorized",
  },
}

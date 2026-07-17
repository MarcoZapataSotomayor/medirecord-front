import {
  Activity,
  FileCheck2,
  FileClock,
  FileText,
  Files,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users,
  BriefcaseMedical,
  FileSearch,
  UserRound,
  Cpu,
} from "lucide-react"

import type { UserRole } from "@/types/user"

export interface NavigationItem {
  title: string
  icon: typeof LayoutDashboard
  path?: string
  allowedRoles: UserRole[]
  enabled: boolean
  description?: string
  futureLabel?: string
}

export const NAVIGATION_BY_ROLE: Record<UserRole, NavigationItem[]> = {
  ADMIN: [
    {
      title: "Inicio",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      allowedRoles: ["ADMIN"],
      enabled: true,
      description: "Vista inicial del panel",
    },
    { title: "Participantes", icon: Users, path: "/app/participants", allowedRoles: ["ADMIN"], enabled: true, description: "Registro y consulta de cuentas" },
    { title: "Actividad", icon: Activity, path: "/app/activity", allowedRoles: ["ADMIN"], enabled: true, description: "Seguimiento de operaciones" },
    { title: "Transacciones", icon: Cpu, path: "/app/transactions", allowedRoles: ["ADMIN"], enabled: true, description: "Auditoría de transacciones" },
    { title: "Perfil", icon: UserRound, path: "/app/profile", allowedRoles: ["ADMIN"], enabled: true, description: "Datos del usuario" },
    { title: "Configuración", icon: Settings2, path: "/app/settings", allowedRoles: ["ADMIN"], enabled: true, description: "Preferencias del sistema" },
  ],
  PATIENT: [
    {
      title: "Inicio",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      allowedRoles: ["PATIENT"],
      enabled: true,
      description: "Resumen personal",
    },
    { title: "Mis documentos", icon: FileText, path: "/app/documents", allowedRoles: ["PATIENT"], enabled: true, description: "Documentos personales" },
    { title: "Autorizaciones", icon: ShieldCheck, path: "/app/permissions", allowedRoles: ["PATIENT"], enabled: true, description: "Permisos emitidos y activos" },
    { title: "Historial", icon: FileClock, path: "/app/activity", allowedRoles: ["PATIENT"], enabled: true, description: "Actividad y eventos" },
    { title: "Transacciones", icon: Cpu, path: "/app/transactions", allowedRoles: ["PATIENT"], enabled: true, description: "Tus transacciones de sesión" },
    { title: "Perfil", icon: UserRound, path: "/app/profile", allowedRoles: ["PATIENT"], enabled: true, description: "Datos del paciente" },
    { title: "Configuración", icon: Settings2, path: "/app/settings", allowedRoles: ["PATIENT"], enabled: true, description: "Preferencias" },
  ],
  DOCTOR: [
    {
      title: "Inicio",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      allowedRoles: ["DOCTOR"],
      enabled: true,
      description: "Panel clínico inicial",
    },
    { title: "Documentos compartidos", icon: Files, path: "/app/authorized-documents", allowedRoles: ["DOCTOR"], enabled: true, description: "Accesos autorizados" },
    { title: "Mis autorizaciones", icon: ShieldCheck, path: "/app/permissions", allowedRoles: ["DOCTOR"], enabled: true, description: "Permisos recibidos" },
    { title: "Historial", icon: FileClock, path: "/app/activity", allowedRoles: ["DOCTOR"], enabled: true, description: "Consultas y eventos" },
    { title: "Transacciones", icon: Cpu, path: "/app/transactions", allowedRoles: ["DOCTOR"], enabled: true, description: "Tus consultas firmadas" },
    { title: "Perfil", icon: UserRound, path: "/app/profile", allowedRoles: ["DOCTOR"], enabled: true, description: "Datos profesionales" },
    { title: "Configuración", icon: Settings2, path: "/app/settings", allowedRoles: ["DOCTOR"], enabled: true, description: "Preferencias" },
  ],
  CLINIC: [
    {
      title: "Inicio",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      allowedRoles: ["CLINIC"],
      enabled: true,
      description: "Panel institucional",
    },
    { title: "Documentos autorizados", icon: Files, path: "/app/authorized-documents", allowedRoles: ["CLINIC"], enabled: true, description: "Documentos compartidos" },
    { title: "Permisos vigentes", icon: FileCheck2, path: "/app/permissions", allowedRoles: ["CLINIC"], enabled: true, description: "Autorizaciones activas" },
    { title: "Historial", icon: FileClock, path: "/app/activity", allowedRoles: ["CLINIC"], enabled: true, description: "Registro operativo" },
    { title: "Transacciones", icon: Cpu, path: "/app/transactions", allowedRoles: ["CLINIC"], enabled: true, description: "Tus accesos institucionales" },
    { title: "Perfil institucional", icon: BriefcaseMedical, path: "/app/profile", allowedRoles: ["CLINIC"], enabled: true, description: "Datos de la institución" },
    { title: "Configuración", icon: Settings2, path: "/app/settings", allowedRoles: ["CLINIC"], enabled: true, description: "Preferencias" },
  ],
  INSURANCE: [
    {
      title: "Inicio",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      allowedRoles: ["INSURANCE"],
      enabled: true,
      description: "Panel inicial de verificación",
    },
    { title: "Documentos autorizados", icon: Files, path: "/app/authorized-documents", allowedRoles: ["INSURANCE"], enabled: true, description: "Documentos compartidos" },
    { title: "Verificaciones", icon: FileSearch, path: "/app/permissions", allowedRoles: ["INSURANCE"], enabled: true, description: "Revisión de coberturas" },
    { title: "Historial", icon: FileClock, path: "/app/activity", allowedRoles: ["INSURANCE"], enabled: true, description: "Auditoría y trazabilidad" },
    { title: "Transacciones", icon: Cpu, path: "/app/transactions", allowedRoles: ["INSURANCE"], enabled: true, description: "Tus verificaciones de cobertura" },
    { title: "Perfil institucional", icon: BriefcaseMedical, path: "/app/profile", allowedRoles: ["INSURANCE"], enabled: true, description: "Datos de la entidad" },
    { title: "Configuración", icon: Settings2, path: "/app/settings", allowedRoles: ["INSURANCE"], enabled: true, description: "Preferencias" },
  ],
}

export function getNavigationItemsForRole(role: UserRole) {
  return NAVIGATION_BY_ROLE[role]
}
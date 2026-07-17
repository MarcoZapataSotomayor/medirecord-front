import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/types/user"

const roleLabelMap: Record<UserRole, string> = {
  ADMIN: "Administrador",
  PATIENT: "Paciente",
  DOCTOR: "Médico",
  CLINIC: "Clínica",
  INSURANCE: "Aseguradora",
}

const roleClassMap: Record<UserRole, string> = {
  ADMIN: "border-slate-300 bg-slate-100 text-slate-800",
  PATIENT: "border-emerald-200 bg-emerald-50 text-emerald-800",
  DOCTOR: "border-sky-200 bg-sky-50 text-sky-800",
  CLINIC: "border-teal-200 bg-teal-50 text-teal-800",
  INSURANCE: "border-amber-200 bg-amber-50 text-amber-900",
}

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <Badge variant="outline" className={roleClassMap[role]}>{roleLabelMap[role]}</Badge>
}
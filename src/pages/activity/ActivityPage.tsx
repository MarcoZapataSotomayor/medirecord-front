import { useMemo, useState } from "react"
import { Search, FileClock, Activity, ShieldCheck, Clock, Users, FileText, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoAccessRecords } from "@/hooks/use-demo-access-records"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { demoActivities } from "@/mocks/activities"
import { filterActivityByRoleAndRange, abbreviateHash } from "@/utils/activity-history"
import { formatLongDate } from "@/utils/dashboard"
import type { Activity as ActivityItem, ActivityType } from "@/types/activity"

export function ActivityPage() {
  const { currentUser } = useDemoSession()
  const { accessRecords } = useDemoAccessRecords()
  const { permissions } = useDemoPermissions()
  const { documents } = useDemoDocuments()

  const [searchText, setSearchText] = useState("")
  const [timeRange, setTimeRange] = useState<"ALL" | "7_DAYS" | "30_DAYS">("ALL")
  const [eventType, setEventType] = useState<ActivityType | "ALL">("ALL")

  const isPatient = currentUser.role === "PATIENT"
  const isAdmin = currentUser.role === "ADMIN"

  // Merge static demoActivities and dynamic accessRecords context into a single array of ActivityItems
  const allActivities = useMemo(() => {
    // 1. Map our dynamic accessRecords to Activity items
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

    // 2. Add dynamic permission emissions/revocations from context as activities if they are not in demoActivities
    // (We will also keep the static ones)
    const activeAndRevokedPermissionsActivities: ActivityItem[] = []
    
    // We only want to capture the dynamic ones registered during the session
    // (those that start with 'perm-' and are not the initial ones)
    permissions.forEach((perm) => {
      if (perm.id.startsWith("perm-")) {
        // Issuance
        activeAndRevokedPermissionsActivities.push({
          id: `act-iss-${perm.id}`,
          type: "PERMISSION_ISSUED",
          title: "Autorización emitida",
          description: `${perm.patientName} emitió credencial de acceso para ${perm.authorizedUserName}`,
          occurredAt: perm.issuedAt,
          actorId: perm.patientId,
          actorName: perm.patientName,
          relatedUserId: perm.authorizedUserId,
          documentId: perm.documentId,
          permissionId: perm.id,
          status: "SUCCESS"
        })

        // Revocation
        if (perm.status === "REVOKED") {
          activeAndRevokedPermissionsActivities.push({
            id: `act-rev-${perm.id}`,
            type: "PERMISSION_REVOKED",
            title: "Autorización revocada",
            description: `${perm.patientName} revocó credencial de acceso de ${perm.authorizedUserName}`,
            occurredAt: perm.issuedAt, // Approximated
            actorId: perm.patientId,
            actorName: perm.patientName,
            relatedUserId: perm.authorizedUserId,
            documentId: perm.documentId,
            permissionId: perm.id,
            status: "WARNING"
          })
        }
      }
    })

    return [...demoActivities, ...mappedAccessActivities, ...activeAndRevokedPermissionsActivities]
  }, [accessRecords, permissions])

  // Filter activities based on filters
  const filteredActivities = useMemo(() => {
    let result = filterActivityByRoleAndRange(allActivities, currentUser.role, currentUser.id, timeRange, searchText)
    if (eventType !== "ALL") {
      result = result.filter((act) => act.type === eventType)
    }
    return result
  }, [allActivities, currentUser.role, currentUser.id, timeRange, eventType, searchText])

  const handleClearFilters = () => {
    setSearchText("")
    setTimeRange("ALL")
    setEventType("ALL")
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const roleActivities = filterActivityByRoleAndRange(allActivities, currentUser.role, currentUser.id, "ALL")
    const totalEvents = roleActivities.length

    if (isAdmin) {
      const documentsCount = documents.length
      const permissionsCount = permissions.length
      const accessesCount = accessRecords.length
      return { totalEvents, documentsCount, permissionsCount, accessesCount }
    }

    if (isPatient) {
      const issued = permissions.filter((p) => p.patientId === currentUser.id).length
      const revoked = permissions.filter((p) => p.patientId === currentUser.id && p.status === "REVOKED").length
      const accessesToMe = accessRecords.filter((rec) => rec.patientId === currentUser.id).length
      return { totalEvents, issued, revoked, accessesToMe }
    }

    // DOCTOR, CLINIC, INSURANCE
    const received = permissions.filter((p) => p.authorizedUserId === currentUser.id).length
    const registered = accessRecords.filter((rec) => rec.actorId === currentUser.id).length
    const recent = roleActivities.filter(
      (act) => Date.now() - new Date(act.occurredAt).getTime() < 24 * 60 * 60 * 1000,
    ).length
    
    return { totalEvents, received, registered, recent }
  }, [allActivities, currentUser, documents, permissions, accessRecords, isPatient, isAdmin])

  // Title and desc by role
  const pageHeadings = useMemo(() => {
    switch (currentUser.role) {
      case "ADMIN":
        return {
          title: "Actividad del sistema",
          desc: "Consulta eventos técnicos y administrativos registrados en MediRecord.",
        }
      case "PATIENT":
        return {
          title: "Historial de mis documentos",
          desc: "Consulta autorizaciones y accesos relacionados con tus documentos.",
        }
      case "DOCTOR":
        return {
          title: "Historial de consultas",
          desc: "Consulta las acciones registradas por tu cuenta profesional.",
        }
      case "CLINIC":
        return {
          title: "Historial institucional",
          desc: "Consulta los accesos registrados por la cuenta de la clínica.",
        }
      default:
        return {
          title: "Historial de verificaciones",
          desc: "Consulta las verificaciones realizadas por la cuenta institucional.",
        }
    }
  }, [currentUser.role])

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "USER_REGISTERED":
        return <Users className="size-4 text-sky-600" />
      case "DOCUMENT_REGISTERED":
        return <FileText className="size-4 text-emerald-600" />
      case "PERMISSION_ISSUED":
        return <ShieldCheck className="size-4 text-emerald-600" />
      case "PERMISSION_REVOKED":
        return <AlertTriangle className="size-4 text-rose-600" />
      case "PERMISSION_EXPIRED":
        return <Clock className="size-4 text-amber-600" />
      case "CONSULTATION_REGISTERED":
      case "DOCUMENT_ACCESSED":
        return <Activity className="size-4 text-indigo-600" />
      default:
        return <FileClock className="size-4 text-slate-600" />
    }
  }

  const getActivityBadgeVariant = (type: ActivityType) => {
    switch (type) {
      case "PERMISSION_REVOKED":
        return "border-rose-200 bg-rose-50 text-rose-800"
      case "PERMISSION_EXPIRED":
        return "border-amber-200 bg-amber-50 text-amber-800"
      case "PERMISSION_ISSUED":
      case "DOCUMENT_REGISTERED":
        return "border-emerald-200 bg-emerald-50 text-emerald-800"
      default:
        return "border-slate-200 bg-slate-50 text-slate-700"
    }
  }

  const getActivityLabel = (type: ActivityType) => {
    switch (type) {
      case "USER_REGISTERED":
        return "Registro usuario"
      case "DOCUMENT_REGISTERED":
        return "Documento subido"
      case "PERMISSION_ISSUED":
        return "Acceso otorgado"
      case "PERMISSION_REVOKED":
        return "Acceso revocado"
      case "PERMISSION_EXPIRED":
        return "Acceso expirado"
      case "CONSULTATION_REGISTERED":
        return "Consulta"
      case "DOCUMENT_ACCESSED":
        return "Acceso de lectura"
      default:
        return "Evento"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{pageHeadings.title}</h1>
          <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800">
            Modo demostración
          </Badge>
        </div>
        <p className="text-sm text-slate-500">{pageHeadings.desc}</p>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Eventos totales</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalEvents}</p>
        </Card>

        {isAdmin && (
          <>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Documentos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{(stats as any).documentsCount}</p>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Permisos emitidos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{(stats as any).permissionsCount}</p>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Accesos registrados</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{(stats as any).accessesCount}</p>
            </Card>
          </>
        )}

        {isPatient && (
          <>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Permisos emitidos</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{(stats as any).issued}</p>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Permisos revocados</p>
              <p className="text-2xl font-bold text-rose-700 mt-1">{(stats as any).revoked}</p>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Accesos a mis docs</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{(stats as any).accessesToMe}</p>
            </Card>
          </>
        )}

        {!isAdmin && !isPatient && (
          <>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Permisos vigentes</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{(stats as any).received}</p>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Accesos registrados</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{(stats as any).registered}</p>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Acciones hoy</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{(stats as any).recent}</p>
            </Card>
          </>
        )}
      </section>

      {/* Filters */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.75fr))_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="act-search" className="text-sm font-medium text-slate-700">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="act-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por descripción, documento o ID..."
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="act-range" className="text-sm font-medium text-slate-700">
              Fecha
            </label>
            <Select value={timeRange} onValueChange={(val) => { if (val) setTimeRange(val as any) }}>
              <SelectTrigger id="act-range" className="bg-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los eventos</SelectItem>
                <SelectItem value="7_DAYS">Últimos 7 días</SelectItem>
                <SelectItem value="30_DAYS">Últimos 30 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="act-type" className="text-sm font-medium text-slate-700">
              Tipo de evento
            </label>
            <Select value={eventType} onValueChange={(val) => { if (val) setEventType(val as any) }}>
              <SelectTrigger id="act-type" className="bg-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                {isAdmin && <SelectItem value="USER_REGISTERED">Registro de usuario</SelectItem>}
                <SelectItem value="DOCUMENT_REGISTERED">Documento registrado</SelectItem>
                <SelectItem value="PERMISSION_ISSUED">Acceso otorgado</SelectItem>
                <SelectItem value="PERMISSION_REVOKED">Acceso revocado</SelectItem>
                <SelectItem value="PERMISSION_EXPIRED">Acceso expirado</SelectItem>
                <SelectItem value="CONSULTATION_REGISTERED">Consulta clínica</SelectItem>
                <SelectItem value="DOCUMENT_ACCESSED">Acceso de lectura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button type="button" variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline List */}
      {filteredActivities.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white shadow-sm p-12 text-center flex flex-col items-center gap-4">
          <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500">
            <FileClock className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">No hay actividad disponible para esta cuenta</h2>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed mx-auto">
              Los eventos y operaciones registradas localmente en este navegador aparecerán aquí.
            </p>
          </div>
        </Card>
      ) : (
        <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6">
          {filteredActivities.map((act) => (
            <div key={act.id} className="relative">
              {/* Dot Icon */}
              <span className="absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
                {getActivityIcon(act.type)}
              </span>

              <div className="space-y-1.5 pl-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{act.title}</h3>
                  <Badge variant="outline" className={getActivityBadgeVariant(act.type) + " text-[10px] py-0 px-1.5"}>
                    {getActivityLabel(act.type)}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {abbreviateHash(act.id)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-normal max-w-2xl">{act.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{formatLongDate(act.occurredAt)}</span>
                  <span>{new Date(act.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {act.actorName && (
                    <>
                      <span>•</span>
                      <span>Actor: {act.actorName}</span>
                    </>
                  )}
                  {act.documentId && (
                    <>
                      <span>•</span>
                      <span className="font-mono">Doc ID: {abbreviateHash(act.documentId)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

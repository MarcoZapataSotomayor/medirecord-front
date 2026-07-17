import { useMemo } from "react"
import { User, Mail, Phone, MapPin } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoAccessRecords } from "@/hooks/use-demo-access-records"
import { demoProfileDetails } from "@/mocks/profile-details"
import { abbreviateWalletAddress } from "@/utils/wallet"

export function ProfilePage() {
  const { currentUser } = useDemoSession()
  const { documents } = useDemoDocuments()
  const { permissions } = useDemoPermissions()
  const { accessRecords } = useDemoAccessRecords()

  const profileDetail = useMemo(() => {
    return demoProfileDetails[currentUser.id] || {
      userId: currentUser.id,
      phone: "No disponible",
      email: "No disponible",
      address: "No disponible",
    }
  }, [currentUser.id])

  const stats = useMemo(() => {
    const ownDocs = documents.filter((d) => d.ownerId === currentUser.id).length
    const ownPerms = permissions.filter((p) => p.patientId === currentUser.id).length
    const activePerms = permissions.filter((p) => p.patientId === currentUser.id && p.status === "ACTIVE").length
    const revokedPerms = permissions.filter((p) => p.patientId === currentUser.id && p.status === "REVOKED").length
    
    const receivedPerms = permissions.filter((p) => p.authorizedUserId === currentUser.id && p.status === "ACTIVE").length
    const actorAccesses = accessRecords.filter((rec) => rec.actorId === currentUser.id).length

    return {
      ownDocs,
      ownPerms,
      activePerms,
      revokedPerms,
      receivedPerms,
      actorAccesses,
    }
  }, [documents, permissions, accessRecords, currentUser.id])

  const roleLabel = useMemo(() => {
    switch (currentUser.role) {
      case "ADMIN":
        return "Administrador"
      case "PATIENT":
        return "Paciente"
      case "DOCTOR":
        return "Médico"
      case "CLINIC":
        return "Clínica / IPS"
      default:
        return "Aseguradora"
    }
  }, [currentUser.role])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardContent className="p-6 relative pt-12">
          {/* Avatar container */}
          <div className="absolute -top-12 left-6 rounded-full border-4 border-white bg-slate-100 p-3 text-slate-600 shadow-sm">
            <User className="size-12" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{currentUser.fullName}</h1>
                <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800">
                  Modo demostración
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="font-semibold text-blue-600">{roleLabel}</span>
                <span>•</span>
                <span className="font-mono text-xs">{abbreviateWalletAddress(currentUser.walletAddress)}</span>
                <span>•</span>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] py-0">
                  Activo
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact info column */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-950 uppercase tracking-wider">
                Datos de contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Mail className="size-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-medium">Correo electrónico</p>
                  <p className="text-slate-800 break-all font-semibold mt-0.5">{profileDetail.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="size-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-medium">Teléfono</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{profileDetail.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 font-medium">Dirección física</p>
                  <p className="text-slate-800 leading-normal font-semibold mt-0.5">{profileDetail.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tech Details column */}
        <div className="md:col-span-2 space-y-6">
          {/* Role specific view card */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-950">Información del Rol</CardTitle>
              <CardDescription className="text-xs">
                Configuración y credenciales de acceso vinculadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">ID Técnico del usuario</span>
                <code className="col-span-2 font-mono text-slate-700">{currentUser.id}</code>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Dirección Wallet completa</span>
                <code className="col-span-2 font-mono text-slate-600 break-all bg-slate-50 p-2 border border-slate-100 rounded">
                  {currentUser.walletAddress}
                </code>
              </div>

              {/* Specialty & License details for DOCTOR */}
              {currentUser.role === "DOCTOR" && (
                <>
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Especialidad</span>
                    <span className="col-span-2 font-semibold text-slate-800">{profileDetail.specialty}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Cédula profesional / CMP</span>
                    <span className="col-span-2 font-semibold text-slate-800">{profileDetail.licenseNumber}</span>
                  </div>
                </>
              )}

              {/* Institutional Details for CLINIC or INSURANCE */}
              {(currentUser.role === "CLINIC" || currentUser.role === "INSURANCE") && (
                <>
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">RUC Institucional</span>
                    <span className="col-span-2 font-semibold text-slate-800">{profileDetail.ruc}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">ID Registro Sanitario / SUSALUD</span>
                    <span className="col-span-2 font-semibold text-slate-800">{profileDetail.institutionalId}</span>
                  </div>
                </>
              )}

              {/* Descriptive text and statistics */}
              {currentUser.role === "ADMIN" && (
                <div className="pt-2 text-slate-500 italic">
                  La cuenta administradora no recibe acceso médico por su rol.
                </div>
              )}

              {currentUser.role === "PATIENT" && (
                <div className="space-y-4 pt-2">
                  <p className="text-slate-500 italic">
                    Tú controlas quién puede consultar tus documentos y durante cuánto tiempo.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Mis documentos</span>
                      <span className="text-lg font-bold text-slate-900 mt-1 block">{stats.ownDocs}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Autorizaciones</span>
                      <span className="text-lg font-bold text-slate-900 mt-1 block">{stats.ownPerms}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Activas / Revocadas</span>
                      <span className="text-xs font-semibold text-slate-700 mt-2 block">
                        {stats.activePerms} / {stats.revokedPerms}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentUser.role === "DOCTOR" && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Permisos vigentes</span>
                      <span className="text-lg font-bold text-emerald-700 mt-1 block">{stats.receivedPerms}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Consultas registradas</span>
                      <span className="text-lg font-bold text-indigo-700 mt-1 block">{stats.actorAccesses}</span>
                    </div>
                  </div>
                </div>
              )}

              {(currentUser.role === "CLINIC" || currentUser.role === "INSURANCE") && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Permisos recibidos</span>
                      <span className="text-lg font-bold text-emerald-700 mt-1 block">{stats.receivedPerms}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Accesos auditados</span>
                      <span className="text-lg font-bold text-indigo-700 mt-1 block">{stats.actorAccesses}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

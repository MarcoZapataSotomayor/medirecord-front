import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShieldCheck, Search, ShieldAlert, Eye, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoTransactions } from "@/hooks/use-demo-transactions"
import { getEffectivePermissionStatus } from "@/utils/permissions"
import { type PermissionFilters } from "@/utils/permissions"
import { formatLongDate } from "@/utils/dashboard"
import { TransactionStatusDialog } from "@/components/transactions/TransactionStatusDialog"
import type { Permission, PermissionStatus } from "@/types/permission"
import type { TransactionRecord } from "@/types/transaction"

const initialFilters: PermissionFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  sort: "ISSUED_DESC",
}

export function PermissionsPage() {
  const { currentUser } = useDemoSession()
  const { permissions, revokePermission } = useDemoPermissions()
  const { registerTransaction } = useDemoTransactions()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<PermissionFilters>(initialFilters)
  const [revokingPermission, setRevokingPermission] = useState<Permission | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isTxOpen, setIsTxOpen] = useState(false)

  const isPatient = currentUser.role === "PATIENT"

  // Filter permissions based on user role
  const patientPermissions = useMemo(() => {
    if (isPatient) {
      return permissions.filter((p) => p.patientId === currentUser.id)
    } else {
      return permissions.filter((p) => p.authorizedUserId === currentUser.id)
    }
  }, [permissions, currentUser.id, isPatient])

  // Stats calculation
  const stats = useMemo(() => {
    let total = 0
    let active = 0
    let expired = 0
    let revoked = 0

    patientPermissions.forEach((p) => {
      total++
      const effStatus = getEffectivePermissionStatus(p)
      if (effStatus === "ACTIVE") active++
      else if (effStatus === "EXPIRED") expired++
      else if (effStatus === "REVOKED") revoked++
    })

    return { total, active, expired, revoked }
  }, [patientPermissions])

  // Custom filters based on role search requirements
  const filteredPermissions = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    
    let result = patientPermissions.filter((perm) => {
      const matchesSearch =
        q.length === 0 ||
        perm.documentName.toLowerCase().includes(q) ||
        (isPatient 
          ? perm.authorizedUserName.toLowerCase().includes(q) 
          : perm.patientName.toLowerCase().includes(q)) ||
        perm.authorizedWallet.toLowerCase().includes(q)

      const matchesRole = filters.role === "ALL" || perm.authorizedRole === filters.role
      const matchesStatus = filters.status === "ALL" || getEffectivePermissionStatus(perm) === filters.status

      return matchesSearch && matchesRole && matchesStatus
    })

    result.sort((a, b) => {
      if (filters.sort === "ISSUED_DESC") {
        return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      }
      if (filters.sort === "ISSUED_ASC") {
        return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime()
      }
      if (filters.sort === "EXPIRY_DESC") {
        return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
      }
      if (filters.sort === "EXPIRY_ASC") {
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
      }
      return 0
    })

    return result
  }, [patientPermissions, filters, isPatient])

  const handleClearFilters = () => setFilters(initialFilters)

  // Revocation flow
  const handleStartRevoke = (perm: Permission) => {
    setRevokingPermission(perm)
    setIsConfirmOpen(true)
  }

  const handleConfirmRevokeAction = () => {
    setIsConfirmOpen(false)
    setIsTxOpen(true)
  }

  const handleTxConfirmed = (txRecord: TransactionRecord) => {
    if (!revokingPermission) return
    const finalHash = txRecord.transactionHash || `0xrevokedhash${Date.now()}`
    revokePermission(revokingPermission.id, finalHash)

    // Register tech transaction log
    registerTransaction({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      operationType: "PERMISSION_REVOKED",
      operationLabel: "Revocación de autorización",
      relatedDocumentId: revokingPermission.documentId,
      relatedPermissionId: revokingPermission.id,
      transactionHash: finalHash,
      blockNumber: txRecord.blockNumber || 0,
      gasUsed: txRecord.gasUsed || "0",
      status: "CONFIRMED",
    })

    toast.success("Autorización revocada en modo demostración.", {
      description: "La credencial de acceso ya no se encuentra activa."
    })
    setRevokingPermission(null)
  }

  const getStatusBadgeClass = (status: PermissionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "border-emerald-200 bg-emerald-50 text-emerald-800"
      case "EXPIRED":
        return "border-amber-200 bg-amber-50 text-amber-800"
      case "REVOKED":
        return "border-rose-200 bg-rose-50 text-rose-800"
      default:
        return "border-slate-200 bg-slate-100 text-slate-700"
    }
  }

  const getStatusLabel = (status: PermissionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "Activo"
      case "EXPIRED":
        return "Expirado"
      case "REVOKED":
        return "Revocado"
      default:
        return status
    }
  }

  // Text headings based on roles
  const pageHeadings = useMemo(() => {
    switch (currentUser.role) {
      case "DOCTOR":
        return {
          title: "Mis autorizaciones recibidas",
          desc: "Consulta las credenciales de acceso otorgadas por los pacientes.",
        }
      case "CLINIC":
        return {
          title: "Permisos institucionales",
          desc: "Consulta las autorizaciones emitidas para la cuenta institucional.",
        }
      case "INSURANCE":
        return {
          title: "Verificaciones autorizadas",
          desc: "Consulta las autorizaciones concedidas para procesos de cobertura y auditoría.",
        }
      default:
        return {
          title: "Mis autorizaciones",
          desc: "Consulta y administra las autorizaciones emitidas para tus documentos.",
        }
    }
  }, [currentUser.role])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{pageHeadings.title}</h1>
            <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800">
              Modo demostración
            </Badge>
          </div>
          <p className="text-sm text-slate-500">{pageHeadings.desc}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            {isPatient ? "Emitidas" : "Recibidas"}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Activas</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.active}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Expiradas</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.expired}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Revocadas</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.revoked}</p>
        </Card>
      </section>

      {/* Filters */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.65fr))_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="perm-search" className="text-sm font-medium text-slate-700">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="perm-search"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder={isPatient ? "Buscar por documento o destinatario..." : "Buscar por documento o paciente..."}
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="perm-role" className="text-sm font-medium text-slate-700">
              Rol autorizado
            </label>
            <Select value={filters.role} onValueChange={(val) => { if (val) setFilters((prev) => ({ ...prev, role: val })) }}>
              <SelectTrigger id="perm-role" className="bg-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los roles</SelectItem>
                <SelectItem value="DOCTOR">Médicos</SelectItem>
                <SelectItem value="CLINIC">Clínicas</SelectItem>
                <SelectItem value="INSURANCE">Aseguradoras</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="perm-status" className="text-sm font-medium text-slate-700">
              Estado
            </label>
            <Select value={filters.status} onValueChange={(val) => { if (val) setFilters((prev) => ({ ...prev, status: val as PermissionStatus | "ALL" })) }}>
              <SelectTrigger id="perm-status" className="bg-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="EXPIRED">Expirados</SelectItem>
                <SelectItem value="REVOKED">Revocados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="perm-sort" className="text-sm font-medium text-slate-700">
              Orden
            </label>
            <Select value={filters.sort} onValueChange={(val) => { if (val) setFilters((prev) => ({ ...prev, sort: val as any })) }}>
              <SelectTrigger id="perm-sort" className="bg-white">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ISSUED_DESC">Emisión (Más reciente)</SelectItem>
                <SelectItem value="ISSUED_ASC">Emisión (Más antiguo)</SelectItem>
                <SelectItem value="EXPIRY_DESC">Vencimiento (Más lejano)</SelectItem>
                <SelectItem value="EXPIRY_ASC">Vencimiento (Más cercano)</SelectItem>
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

      {/* Content */}
      {patientPermissions.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white shadow-sm p-12 text-center flex flex-col items-center gap-4">
          <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">
              {isPatient ? "No tienes autorizaciones registradas" : "No tienes autorizaciones recibidas"}
            </h2>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed mx-auto">
              {isPatient 
                ? "Puedes emitir autorizaciones para tus documentos desde la sección \"Mis documentos\"."
                : "Aparecerán aquí cuando un paciente te otorgue acceso a sus documentos médicos."}
            </p>
          </div>
          {isPatient && (
            <Button onClick={() => navigate("/app/documents")}>Ir a mis documentos</Button>
          )}
        </Card>
      ) : filteredPermissions.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white shadow-sm p-12 text-center flex flex-col items-center gap-4">
          <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500">
            <Search className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">No se encontraron autorizaciones</h2>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed mx-auto">
              Ninguno de tus permisos coincide con los filtros establecidos.
            </p>
          </div>
          <Button onClick={handleClearFilters}>Limpiar filtros</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                <TableHead className="font-semibold text-slate-700">Credencial</TableHead>
                <TableHead className="font-semibold text-slate-700">Documento</TableHead>
                <TableHead className="font-semibold text-slate-700">
                  {isPatient ? "Destinatario" : "Paciente"}
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Rol</TableHead>
                <TableHead className="font-semibold text-slate-700">Emisión</TableHead>
                <TableHead className="font-semibold text-slate-700">Expiración</TableHead>
                <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((perm) => {
                const effStatus = getEffectivePermissionStatus(perm)
                return (
                  <TableRow key={perm.id} className="hover:bg-slate-50/30">
                    <TableCell className="font-mono text-xs font-semibold text-slate-500">
                      #{perm.tokenId}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 truncate max-w-[150px]">{perm.documentName}</TableCell>
                    <TableCell className="text-slate-800">
                      {isPatient ? perm.authorizedUserName : perm.patientName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                        {perm.authorizedRole === "DOCTOR" ? "Médico" : perm.authorizedRole === "CLINIC" ? "Clínica" : "Aseguradora"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{formatLongDate(perm.issuedAt)}</TableCell>
                    <TableCell className="text-xs text-slate-600">{formatLongDate(perm.expiresAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(effStatus)}>
                        {getStatusLabel(effStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/app/permissions/${perm.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" }) + " h-8 gap-1 text-xs inline-flex items-center"}
                        >
                          <Eye className="size-3.5" />
                          <span>Ver</span>
                        </Link>

                        {isPatient ? (
                          effStatus === "ACTIVE" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartRevoke(perm)}
                              className="h-8 gap-1 text-xs text-rose-600 border-rose-200 hover:bg-rose-50/50 hover:text-rose-700"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Revocar</span>
                            </Button>
                          ) : effStatus === "EXPIRED" ? (
                            <Button
                              disabled
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-xs opacity-50 cursor-not-allowed"
                            >
                              <span>Expirado</span>
                            </Button>
                          ) : (
                            <Button
                              disabled
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-xs opacity-50 cursor-not-allowed"
                            >
                              <span>Revocado</span>
                            </Button>
                          )
                        ) : (
                          // For doctors, clinics, insurance
                          effStatus === "ACTIVE" ? (
                            <Link
                              to={`/app/authorized-documents/${perm.documentId}`}
                              className={buttonVariants({ variant: "outline", size: "sm" }) + " h-8 gap-1 text-xs inline-flex items-center border-sky-200 text-sky-700 hover:bg-sky-50/50"}
                            >
                              <FileText className="size-3.5" />
                              <span>Ver documento</span>
                            </Link>
                          ) : effStatus === "EXPIRED" ? (
                            <Button
                              disabled
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-xs opacity-50 cursor-not-allowed"
                              title="El permiso ha expirado y no se puede consultar el documento."
                            >
                              <span>Permiso expirado</span>
                            </Button>
                          ) : (
                            <Button
                              disabled
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-xs opacity-50 cursor-not-allowed"
                              title="El paciente revocó este permiso."
                            >
                              <span>Permiso revocado</span>
                            </Button>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation Dialog for Revocation */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-rose-600" />
              <span>Revocar autorización</span>
            </DialogTitle>
            <DialogDescription>
              La cuenta autorizada dejará de tener acceso mediante esta credencial. Esta acción no podrá deshacerse.
            </DialogDescription>
          </DialogHeader>

          {revokingPermission && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-sm text-slate-700">
              <p><strong>Documento:</strong> {revokingPermission.documentName}</p>
              <p><strong>Destinatario:</strong> {revokingPermission.authorizedUserName}</p>
              <p className="font-mono text-xs text-slate-400 mt-1">Credencial: #{revokingPermission.tokenId}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmRevokeAction}>
              Confirmar revocación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reusable transaction status dialog */}
      <TransactionStatusDialog
        open={isTxOpen}
        onOpenChange={setIsTxOpen}
        actionName="Revocar autorización"
        onConfirmed={handleTxConfirmed}
      />
    </div>
  )
}

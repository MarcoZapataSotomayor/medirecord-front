import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Shield, Calendar, UserRound, KeyRound, AlertTriangle, Hash, EyeOff, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoTransactions } from "@/hooks/use-demo-transactions"
import { getEffectivePermissionStatus } from "@/utils/permissions"
import { formatLongDate } from "@/utils/dashboard"
import { TransactionStatusDialog } from "@/components/transactions/TransactionStatusDialog"
import type { PermissionStatus } from "@/types/permission"
import type { TransactionRecord } from "@/types/transaction"

export function PermissionDetailPage() {
  const { permissionId } = useParams<{ permissionId: string }>()
  const { currentUser } = useDemoSession()
  const { findPermissionById, revokePermission } = useDemoPermissions()
  const { registerTransaction } = useDemoTransactions()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isTxOpen, setIsTxOpen] = useState(false)

  const isPatient = currentUser.role === "PATIENT"

  const permission = useMemo(() => {
    if (!permissionId) return null
    return findPermissionById(permissionId) || null
  }, [permissionId, findPermissionById])

  // Security checks
  const isAuthorized = useMemo(() => {
    if (!permission) return false
    if (isPatient) {
      return permission.patientId === currentUser.id
    } else {
      return permission.authorizedUserId === currentUser.id
    }
  }, [permission, currentUser.id, isPatient])

  const effStatus = useMemo(() => {
    if (!permission) return "EXPIRED" as PermissionStatus
    return getEffectivePermissionStatus(permission)
  }, [permission])

  if (!permission) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-slate-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500 mb-2">
              <EyeOff className="size-6" />
            </div>
            <CardTitle className="text-slate-900">Autorización no encontrada</CardTitle>
            <CardDescription>
              La autorización solicitada no existe o no se encuentra disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/app/permissions"
              className={buttonVariants({ variant: "default" }) + " rounded-lg"}
            >
              Volver a autorizaciones
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-rose-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-rose-200 bg-rose-50 p-4 text-rose-800 mb-2">
              <EyeOff className="size-6" />
            </div>
            <CardTitle className="text-rose-950">Acceso restringido</CardTitle>
            <CardDescription>
              Tu cuenta no tiene permisos para acceder a este módulo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/app/dashboard"
              className={buttonVariants({ variant: "default" }) + " rounded-lg"}
            >
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleStartRevoke = () => {
    setIsConfirmOpen(true)
  }

  const handleConfirmRevokeAction = () => {
    setIsConfirmOpen(false)
    setIsTxOpen(true)
  }

  const handleTxConfirmed = (txRecord: TransactionRecord) => {
    const finalHash = txRecord.transactionHash || `0xrevokedhash${Date.now()}`
    revokePermission(permission.id, finalHash)

    // Register tech transaction log
    registerTransaction({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      operationType: "PERMISSION_REVOKED",
      operationLabel: "Revocación de autorización",
      relatedDocumentId: permission.documentId,
      relatedPermissionId: permission.id,
      transactionHash: finalHash,
      blockNumber: txRecord.blockNumber || 0,
      gasUsed: txRecord.gasUsed || "0",
      status: "CONFIRMED",
    })

    toast.success("Autorización revocada en modo demostración.", {
      description: "La credencial de acceso ya no se encuentra activa."
    })
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/app/permissions"
              className="mr-1 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
              aria-label="Volver a autorizaciones"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Credencial #{permission.tokenId}
            </h1>
            <Badge variant="outline" className={getStatusBadgeClass(effStatus)}>
              {getStatusLabel(effStatus)}
            </Badge>
          </div>
          <p className="text-xs font-mono text-slate-500">ID Técnico: {permission.id}</p>
        </div>

        {isPatient ? (
          effStatus === "ACTIVE" ? (
            <Button
              onClick={handleStartRevoke}
              variant="destructive"
              className="inline-flex items-center gap-2 self-start rounded-lg"
            >
              <Trash2 className="size-4" />
              <span>Revocar autorización</span>
            </Button>
          ) : effStatus === "EXPIRED" ? (
            <Button
              disabled
              variant="outline"
              className="inline-flex items-center gap-2 self-start rounded-lg opacity-50 cursor-not-allowed"
            >
              <span>Expirado</span>
            </Button>
          ) : null
        ) : (
          // For doctor, clinic, insurance
          effStatus === "ACTIVE" ? (
            <Link
              to={`/app/authorized-documents/${permission.documentId}`}
              className={buttonVariants({ variant: "default" }) + " inline-flex items-center gap-2 self-start rounded-lg h-9 px-4 text-sm font-medium"}
            >
              <FileText className="size-4" />
              <span>Ver documento</span>
            </Link>
          ) : null
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Permission Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Detalles de la autorización</CardTitle>
              <CardDescription>Metadatos registrados en la credencial digital.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paciente emisor</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <UserRound className="size-4 text-slate-400" />
                    <span>{permission.patientName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destinatario autorizado</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <UserRound className="size-4 text-slate-400" />
                    <span>{permission.authorizedUserName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol destinatario</span>
                  <p className="font-medium text-slate-700">
                    {permission.authorizedRole === "DOCTOR" ? "Médico" : permission.authorizedRole === "CLINIC" ? "Clínica" : "Aseguradora"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wallet autorizada</span>
                  <p className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-100 p-2 rounded-lg truncate" title={permission.authorizedWallet}>
                    {permission.authorizedWallet}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Documento</span>
                  <p className="font-medium text-slate-700">{permission.documentName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">ID de documento</span>
                  <p className="font-mono text-xs text-slate-500">{permission.documentId}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de acceso</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <KeyRound className="size-4 text-slate-400" />
                    <span>{permission.accessType === "READ" ? "Lectura (Sólo consulta)" : "Escritura (Registrar consultas)"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de emisión</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="size-4 text-slate-400" />
                    <span>{formatLongDate(permission.issuedAt)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiración</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="size-4 text-slate-400" />
                    <span>{formatLongDate(permission.expiresAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código de transacción</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 break-all bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <Hash className="size-3.5 text-slate-400 shrink-0" />
                  <span>{permission.transactionHash}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intransferability box & tech notice */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed text-slate-600">
              <div className="flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/75 p-3.5 text-sky-900">
                <Shield className="size-5 text-sky-700 shrink-0 mt-0.5" />
                <p>
                  Esta credencial representa una autorización de acceso. No representa un documento ni un paciente.
                </p>
              </div>

              {!isPatient && effStatus === "EXPIRED" && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 p-3.5 text-amber-900">
                  <AlertTriangle className="size-5 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    Este permiso ha expirado.
                  </p>
                </div>
              )}

              {!isPatient && effStatus === "REVOKED" && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-rose-900">
                  <AlertTriangle className="size-5 text-rose-700 shrink-0 mt-0.5" />
                  <p>
                    El paciente revocó esta autorización.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 text-amber-900">
                <AlertTriangle className="size-5 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Las credenciales de acceso son estrictamente intransferibles y están sujetas a la verificación del contrato inteligente en Sepolia.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800 text-[10px]">
                    Simulado
                  </Badge>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nota técnica</span>
                </div>
                <p className="text-[11px] leading-normal text-slate-500">
                  Las acciones de revocación emitidas en modo de demostración actualizan el estado de la credencial en el navegador de manera simulada y no ejecutan firmas reales de Sepolia ETH.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-rose-600" />
              <span>Revocar autorización</span>
            </DialogTitle>
            <DialogDescription>
              La cuenta autorizada dejará de tener acceso mediante esta credencial. Esta acción no podrá deshacerse.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-sm text-slate-700">
            <p><strong>Documento:</strong> {permission.documentName}</p>
            <p><strong>Destinatario:</strong> {permission.authorizedUserName}</p>
            <p className="font-mono text-xs text-slate-400 mt-1">Credencial: #{permission.tokenId}</p>
          </div>

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

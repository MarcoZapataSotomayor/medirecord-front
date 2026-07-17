import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Calendar, UserRound, AlertTriangle, EyeOff, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { useDemoAccessRecords } from "@/hooks/use-demo-access-records"
import { useDemoTransactions } from "@/hooks/use-demo-transactions"
import { getEffectivePermissionStatus } from "@/utils/permissions"
import { getActionTypeByRole, getActionLabel } from "@/utils/access-records"
import { formatLongDate } from "@/utils/dashboard"
import { TransactionStatusDialog } from "@/components/transactions/TransactionStatusDialog"
import type { TransactionRecord } from "@/types/transaction"

export function AuthorizedDocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const { currentUser } = useDemoSession()
  const { permissions } = useDemoPermissions()
  const { documents } = useDemoDocuments()
  const { accessRecords, registerAccess } = useDemoAccessRecords()
  const { registerTransaction } = useDemoTransactions()

  const [isTxOpen, setIsTxOpen] = useState(false)

  // Find all permissions received by the current user for this document
  const relatedPermissions = useMemo(() => {
    if (!documentId) return []
    return permissions.filter(
      (p) => p.documentId === documentId && p.authorizedUserId === currentUser.id,
    )
  }, [documentId, permissions, currentUser.id])

  // Get active permission if it exists
  const activePermission = useMemo(() => {
    return relatedPermissions.find((p) => getEffectivePermissionStatus(p) === "ACTIVE") || null
  }, [relatedPermissions])

  // Get expired or revoked permission for status display if no active one exists
  const historicalPermission = useMemo(() => {
    if (activePermission) return null
    if (relatedPermissions.length === 0) return null
    // Prefer expired or revoked over none
    return relatedPermissions[0]
  }, [activePermission, relatedPermissions])

  const document = useMemo(() => {
    if (!documentId) return null
    return documents.find((d) => d.id === documentId) || null
  }, [documentId, documents])

  // Security checks
  const hasNoPermissionAtAll = relatedPermissions.length === 0
  const isExp = historicalPermission && getEffectivePermissionStatus(historicalPermission) === "EXPIRED"
  const isRev = historicalPermission && getEffectivePermissionStatus(historicalPermission) === "REVOKED"

  // Access history for this document by this actor
  const actorHistory = useMemo(() => {
    if (!documentId) return []
    return accessRecords.filter(
      (rec) => rec.documentId === documentId && rec.actorId === currentUser.id,
    )
  }, [documentId, accessRecords, currentUser.id])

  if (hasNoPermissionAtAll) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-rose-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-rose-200 bg-rose-50 p-4 text-rose-800 mb-2">
              <EyeOff className="size-6" />
            </div>
            <CardTitle className="text-rose-950">Acceso restringido</CardTitle>
            <CardDescription>
              No tienes autorización para acceder a este documento.
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

  if (isExp) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-amber-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-amber-200 bg-amber-50 p-4 text-amber-800 mb-2">
              <AlertTriangle className="size-6" />
            </div>
            <CardTitle className="text-amber-950">Permiso expirado</CardTitle>
            <CardDescription>
              La credencial de acceso temporal de este documento ha expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/app/authorized-documents"
              className={buttonVariants({ variant: "default" }) + " rounded-lg"}
            >
              Volver a documentos autorizados
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isRev) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-rose-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-rose-200 bg-rose-50 p-4 text-rose-800 mb-2">
              <AlertTriangle className="size-6" />
            </div>
            <CardTitle className="text-rose-950">Permiso revocado</CardTitle>
            <CardDescription>
              El paciente revocó la autorización de acceso para este documento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/app/authorized-documents"
              className={buttonVariants({ variant: "default" }) + " rounded-lg"}
            >
              Volver a documentos autorizados
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!document || !activePermission) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-slate-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500 mb-2">
              <EyeOff className="size-6" />
            </div>
            <CardTitle className="text-slate-900">Documento no encontrado</CardTitle>
            <CardDescription>
              El documento médico solicitado no existe o tu autorización no está activa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/app/authorized-documents"
              className={buttonVariants({ variant: "default" }) + " rounded-lg"}
            >
              Volver a documentos autorizados
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine role action text
  const actionText =
    currentUser.role === "DOCTOR"
      ? "Registrar consulta"
      : currentUser.role === "CLINIC"
      ? "Registrar acceso institucional"
      : "Registrar verificación"

  const handleStartAuditRecord = () => {
    setIsTxOpen(true)
  }

  const handleTxConfirmed = (txRecord: TransactionRecord) => {
    const actionType = getActionTypeByRole(currentUser.role as any)

    registerAccess({
      permissionId: activePermission.id,
      documentId: document.id,
      documentName: document.name,
      patientId: activePermission.patientId,
      patientName: activePermission.patientName,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorWallet: currentUser.walletAddress,
      actorRole: currentUser.role as any,
      actionType,
      result: "GRANTED",
      transactionHash: txRecord.transactionHash || "",
      blockNumber: txRecord.blockNumber || 0,
      gasUsed: txRecord.gasUsed || "",
    })

    // Register tech transaction log
    let operationType: any = "MEDICAL_CONSULTATION_REGISTERED"
    let operationLabel = "Registro de consulta médica"

    if (currentUser.role === "CLINIC") {
      operationType = "INSTITUTIONAL_ACCESS_REGISTERED"
      operationLabel = "Registro de acceso institucional"
    } else if (currentUser.role === "INSURANCE") {
      operationType = "COVERAGE_VERIFICATION_REGISTERED"
      operationLabel = "Registro de verificación de cobertura"
    }

    registerTransaction({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      operationType,
      operationLabel,
      relatedDocumentId: document.id,
      relatedPermissionId: activePermission.id,
      transactionHash: txRecord.transactionHash || "",
      blockNumber: txRecord.blockNumber || 0,
      gasUsed: txRecord.gasUsed || "0",
      status: "CONFIRMED",
    })

    const successMessage =
      currentUser.role === "DOCTOR"
        ? "Consulta registrada en modo demostración."
        : currentUser.role === "CLINIC"
        ? "Acceso institucional registrado en modo demostración."
        : "Verificación registrada en modo demostración."

    toast.success(successMessage, {
      description: "La acción de auditoría fue registrada simuladamente."
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/app/authorized-documents"
              className="mr-1 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
              aria-label="Volver a documentos autorizados"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{document.name}</h1>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
              Autorización Activa
            </Badge>
          </div>
          <p className="text-xs font-mono text-slate-500">ID Técnico: {document.id}</p>
        </div>

        <Button
          onClick={handleStartAuditRecord}
          className="inline-flex items-center gap-2 self-start rounded-lg"
        >
          <FileText className="size-4" />
          <span>{actionText}</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Document Preview & Validation Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulated validation card */}
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-4 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">Validación de autorización</CardTitle>
                <CardDescription className="text-xs">Verificación local de integridad técnica.</CardDescription>
              </div>
              <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800 text-[10px]">
                Validación simulada
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Documento localizado</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100 text-[10px]">
                    Correcto
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Cuenta autorizada coincidente</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100 text-[10px]">
                    Correcto ({currentUser.fullName})
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Permiso vigente (No expirado)</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100 text-[10px]">
                    Correcto
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estado de credencial</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100 text-[10px]">
                    Activa (#{activePermission.tokenId})
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  Acceso Permitido
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  En la integración final, esta validación será realizada por MediRecordRegistry y el backend.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Simulated PDF Viewer */}
          <Card className="border-slate-200 bg-white shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-64 gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-400">
              <FileText className="size-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">{document.name}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Vista previa no disponible en modo demostración
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                El backend entregará el PDF después de validar la autorización vigente en Sepolia.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side: Metadata & Local Access Logs */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Información del documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paciente</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <UserRound className="size-4 text-slate-400" />
                  <span>{activePermission.patientName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoría</span>
                <p className="font-semibold text-slate-700">{document.category}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Hash del documento</span>
                <code className="font-mono text-xs text-slate-500 block bg-slate-50 p-2 border border-slate-100 rounded truncate" title={document.documentHash}>
                  {document.documentHash}
                </code>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencimiento del permiso</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="size-4 text-slate-400" />
                  <span>{formatLongDate(activePermission.expiresAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Local Access History */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Accesos registrados</CardTitle>
              <CardDescription className="text-xs">Tus accesos auditados localmente en este navegador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {actorHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No has registrado accesos para este documento.</p>
              ) : (
                actorHistory.map((rec) => (
                  <div key={rec.id} className="text-xs space-y-1 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800">{getActionLabel(rec.actionType)}</span>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100 text-[10px]">
                        Permitido
                      </Badge>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{new Date(rec.occurredAt).toLocaleString()}</span>
                      <span>Tx: {rec.transactionHash.slice(0, 8)}...</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TransactionStatusDialog
        open={isTxOpen}
        onOpenChange={setIsTxOpen}
        actionName={actionText}
        onConfirmed={handleTxConfirmed}
      />
    </div>
  )
}

import { useState, useMemo, type FormEvent } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Search, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoParticipants } from "@/hooks/use-demo-participants"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoTransactions } from "@/hooks/use-demo-transactions"
import { TransactionStatusDialog } from "@/components/transactions/TransactionStatusDialog"
import { getValidRecipients, hasActiveDuplicatePermission } from "@/utils/permissions"
import { abbreviateWalletAddress } from "@/utils/wallet"
import type { Permission, AccessType, PermissionRecipientRole } from "@/types/permission"
import type { TransactionRecord } from "@/types/transaction"
import { formatLongDate } from "@/utils/dashboard"

type FormErrors = Partial<Record<"recipient" | "expiryDate" | "accessType", string>>

export function ShareDocumentPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const { currentUser } = useDemoSession()
  const { findDocumentById } = useDemoDocuments()
  const { participants } = useDemoParticipants()
  const { permissions, registerPermission } = useDemoPermissions()
  const { registerTransaction } = useDemoTransactions()

  const navigate = useNavigate()

  // Form states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipientId, setSelectedRecipientId] = useState("")
  const [accessType, setAccessType] = useState<AccessType | "">("")
  const [expiryDate, setExpiryDate] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})

  // Dialog and simulation states
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false)
  const [createdPermission, setCreatedPermission] = useState<Permission | null>(null)

  // Document security verification
  const document = useMemo(() => {
    if (!documentId) return null
    return findDocumentById(documentId) || null
  }, [documentId, findDocumentById])

  const isDocOwner = useMemo(() => {
    if (!document) return false
    return document.ownerId === currentUser.id
  }, [document, currentUser.id])

  // Get valid active recipients (DOCTOR, CLINIC, INSURANCE, not patient, not admin)
  const validRecipients = useMemo(() => {
    return getValidRecipients(participants, currentUser.id)
  }, [participants, currentUser.id])

  // Filter recipients based on search
  const filteredRecipients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return validRecipients.filter((r) => {
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.walletAddress.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q)
      );
    })
  }, [validRecipients, searchQuery])

  const selectedRecipient = useMemo(() => {
    return validRecipients.find((r) => r.id === selectedRecipientId) || null
  }, [validRecipients, selectedRecipientId])

  if (!document) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-slate-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500 mb-2">
              <FileText className="size-6" />
            </div>
            <CardTitle className="text-slate-900">Documento no encontrado</CardTitle>
            <CardDescription>El documento médico solicitado no existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/app/documents" className={buttonVariants({ variant: "default" }) + " rounded-lg"}>
              Volver a mis documentos
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isDocOwner) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-rose-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-rose-200 bg-rose-50 p-4 text-rose-800 mb-2">
              <AlertTriangle className="size-6" />
            </div>
            <CardTitle className="text-rose-950">Acceso restringido</CardTitle>
            <CardDescription>Tu cuenta no tiene permisos para acceder a este módulo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/app/dashboard" className={buttonVariants({ variant: "default" }) + " rounded-lg"}>
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleValidateForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors: FormErrors = {}
    
    if (!selectedRecipientId || !selectedRecipient) {
      nextErrors.recipient = "Debe seleccionar un destinatario registrado."
    }

    if (!accessType) {
      nextErrors.accessType = "Debe seleccionar un tipo de acceso."
    }

    if (!expiryDate) {
      nextErrors.expiryDate = "Debe seleccionar una fecha de expiración."
    } else {
      const selectedTime = new Date(`${expiryDate}T23:59:59`).getTime()
      const nowTime = Date.now()

      if (selectedTime <= nowTime) {
        nextErrors.expiryDate = "La fecha de expiración debe ser una fecha futura."
      }

      // Max 1 year limit check (documented)
      const maxExpiry = nowTime + 366 * 24 * 60 * 60 * 1000
      if (selectedTime > maxExpiry) {
        nextErrors.expiryDate = "La fecha de expiración no puede superar un año desde hoy."
      }
    }

    // Check duplicate active permission
    if (selectedRecipient && !nextErrors.recipient) {
      const hasDuplicate = hasActiveDuplicatePermission(
        document.id,
        selectedRecipient.walletAddress,
        permissions
      )

      if (hasDuplicate) {
        nextErrors.recipient = "Ya existe una autorización activa para este destinatario y documento."
      }
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    // Open transaction dialog
    setIsTxDialogOpen(true)
  }

  const handleTxConfirmed = (txRecord: TransactionRecord) => {
    if (!selectedRecipient || !accessType || !expiryDate) return

    // Normalise expiry date to end of day
    const normalizedExpiry = new Date(`${expiryDate}T23:59:59.000Z`).toISOString()

    const newPerm = registerPermission({
      documentId: document.id,
      documentName: document.name,
      patientId: currentUser.id,
      patientName: currentUser.fullName,
      authorizedUserId: selectedRecipient.id,
      authorizedUserName: selectedRecipient.fullName,
      authorizedWallet: selectedRecipient.walletAddress,
      authorizedRole: selectedRecipient.role as PermissionRecipientRole,
      accessType: accessType as AccessType,
      expiresAt: normalizedExpiry,
    })

    // Modify newly registered permission with the real mock transaction info
    if (newPerm) {
      const finalHash = txRecord.transactionHash || newPerm.transactionHash
      newPerm.transactionHash = finalHash
      setCreatedPermission(newPerm)

      // Register tech transaction log
      registerTransaction({
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        operationType: "PERMISSION_ISSUED",
        operationLabel: "Emisión de autorización",
        relatedDocumentId: document.id,
        relatedPermissionId: newPerm.id,
        transactionHash: finalHash,
        blockNumber: txRecord.blockNumber || 0,
        gasUsed: txRecord.gasUsed || "0",
        status: "CONFIRMED",
      })
    }

    toast.success("Autorización registrada en modo demostración.", {
      description: "La credencial de acceso fue emitida de forma simulada."
    })
  }

  const handleResetForm = () => {
    setSelectedRecipientId("")
    setAccessType("")
    setExpiryDate("")
    setSearchQuery("")
    setErrors({})
    setCreatedPermission(null)
  }

  // If sharing was successful, show result screen
  if (createdPermission) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Autorización emitida</h1>
          <p className="text-sm text-slate-500">Resumen técnico de la credencial digital simulada.</p>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-emerald-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                Credencial de acceso #{createdPermission.tokenId}
              </span>
              <CardTitle className="text-base font-semibold text-slate-900 mt-1">
                Autorización emitida correctamente
              </CardTitle>
            </div>
            <CheckCircle className="size-8 text-emerald-600 shrink-0" />
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Documento</span>
                <span className="font-semibold text-slate-800">{createdPermission.documentName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Destinatario</span>
                <span className="font-semibold text-slate-800">
                  {createdPermission.authorizedUserName} ({createdPermission.authorizedRole === "DOCTOR" ? "Médico" : createdPermission.authorizedRole === "CLINIC" ? "Clínica" : "Aseguradora"})
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Tipo de acceso</span>
                <span className="font-semibold text-slate-800">{createdPermission.accessType === "READ" ? "Lectura" : "Escritura"}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Expiración</span>
                <span className="font-semibold text-slate-800">{formatLongDate(createdPermission.expiresAt)}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100 space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Código de transacción</span>
                <code className="font-mono text-xs text-slate-600 block bg-white p-2 border border-slate-200 rounded break-all">
                  {createdPermission.transactionHash}
                </code>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800">
                  Simulado
                </Badge>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Credencial simulada</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                Esta credencial representa una autorización de acceso digital emitida con fines ilustrativos. En producción, la validez del permiso se audita en el contrato inteligente de MediRecord.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <Button onClick={() => navigate(`/app/permissions/${createdPermission.id}`)} variant="outline">
                Ver autorización
              </Button>
              <Button onClick={() => navigate("/app/documents")} variant="outline">
                Volver a mis documentos
              </Button>
              <Button onClick={handleResetForm}>
                Emitir otra autorización
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            to="/app/documents"
            className="mr-1 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            aria-label="Volver a mis documentos"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Compartir documento</h1>
          <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800">
            Modo demostración
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Emitirás una autorización de acceso técnico para una cuenta previamente registrada.
        </p>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <form className="space-y-5" onSubmit={handleValidateForm}>
            {/* Document Field (Read only) */}
            <div className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Documento</span>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <FileText className="size-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{document.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {document.id}</p>
                </div>
              </div>
            </div>

            {/* Recipient Selection */}
            <div className="space-y-2">
              <label htmlFor="recipient-search" className="text-sm font-semibold text-slate-700 block">
                Destinatario autorizado
              </label>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="recipient-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar médico o entidad por nombre, wallet o rol..."
                  className="pl-9 bg-white"
                />
              </div>

              {/* Recipient selection list */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white">
                {filteredRecipients.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-6">No se encontraron destinatarios válidos.</p>
                ) : (
                  filteredRecipients.map((rec) => {
                    const isSelected = selectedRecipientId === rec.id
                    return (
                      <div
                        key={rec.id}
                        onClick={() => {
                          setSelectedRecipientId(rec.id)
                          setErrors((prev) => ({ ...prev, recipient: undefined }))
                        }}
                        className={`flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 cursor-pointer transition ${
                          isSelected ? "bg-sky-50/50 border-sky-100" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium text-slate-800">{rec.fullName}</p>
                          <p className="font-mono text-[10px] text-slate-400">{abbreviateWalletAddress(rec.walletAddress)}</p>
                        </div>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                          {rec.role === "DOCTOR" ? "Médico" : rec.role === "CLINIC" ? "Clínica" : "Aseguradora"}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
              {errors.recipient ? (
                <p className="text-sm text-rose-600 font-medium">{errors.recipient}</p>
              ) : null}
            </div>

            {/* Access Type Selection */}
            <div className="space-y-2">
              <label htmlFor="access-type" className="text-sm font-semibold text-slate-700 block">
                Tipo de acceso
              </label>
              <Select value={accessType} onValueChange={(val) => {
                if (val === "READ" || val === "WRITE") {
                  setAccessType(val)
                  setErrors((prev) => ({ ...prev, accessType: undefined }))
                }
              }}>
                <SelectTrigger id="access-type" className="bg-white">
                  <SelectValue placeholder="Seleccionar tipo de acceso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ">Lectura (Sólo consulta)</SelectItem>
                  <SelectItem value="WRITE">Escritura (Permite registrar atenciones)</SelectItem>
                </SelectContent>
              </Select>
              {errors.accessType ? (
                <p className="text-sm text-rose-600 font-medium">{errors.accessType}</p>
              ) : null}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label htmlFor="expiry-date" className="text-sm font-semibold text-slate-700 block">
                Fecha de expiración
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value)
                    setErrors((prev) => ({ ...prev, expiryDate: undefined }))
                  }}
                  className="pl-9 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Máximo de duración sugerida: 1 año. La hora de expiración efectiva se normalizará al final del día.
              </p>
              {errors.expiryDate ? (
                <p className="text-sm text-rose-600 font-medium">{errors.expiryDate}</p>
              ) : null}
            </div>

            {/* Disclaimer box */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs leading-relaxed text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                El contenido del permiso no podrá editarse después de ser emitido. Para cambiarlo deberá revocarse y emitirse una nueva autorización.
              </p>
            </div>

            {/* Form actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/app/documents")}>
                Cancelar
              </Button>
              <Button type="submit">Emitir autorización</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <TransactionStatusDialog
        open={isTxDialogOpen}
        onOpenChange={setIsTxDialogOpen}
        actionName="Emitir autorización"
        onConfirmed={handleTxConfirmed}
      />
    </div>
  )
}

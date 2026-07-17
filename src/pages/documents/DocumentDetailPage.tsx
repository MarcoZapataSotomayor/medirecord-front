import { useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Hash, FileText, Calendar, Shield, UserRound, EyeOff, Share2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { useDemoSession } from "@/hooks/use-demo-session"
import { DocumentHashDialog } from "@/components/documents/DocumentHashDialog"
import { formatLongDate } from "@/utils/dashboard"
import type { MedicalDocumentStatus } from "@/types/document"

function getStatusBadgeClass(status: MedicalDocumentStatus): string {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"
    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-700"
    case "RESTRICTED":
      return "border-rose-200 bg-rose-50 text-rose-800"
    default:
      return "border-slate-200 bg-slate-100 text-slate-700"
  }
}

function getStatusLabel(status: MedicalDocumentStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Activo"
    case "ARCHIVED":
      return "Archivado"
    case "RESTRICTED":
      return "Restringido"
    default:
      return status
  }
}

export function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const { currentUser } = useDemoSession()
  const { findDocumentById } = useDemoDocuments()

  const [isHashDialogOpen, setIsHashDialogOpen] = useState(false)

  const document = useMemo(() => {
    if (!documentId) return null
    return findDocumentById(documentId) || null
  }, [documentId, findDocumentById])

  // Security checks
  const isAuthorized = useMemo(() => {
    if (!document) return false
    return document.ownerId === currentUser.id
  }, [document, currentUser.id])

  if (!document) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-slate-200 bg-white shadow-sm text-center p-6">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500 mb-2">
              <EyeOff className="size-6" />
            </div>
            <CardTitle className="text-slate-900">Documento no encontrado</CardTitle>
            <CardDescription>
              El documento solicitado no existe o no se encuentra disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/app/documents"
              className={buttonVariants({ variant: "default" }) + " rounded-lg"}
            >
              Volver a mis documentos
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si existe pero pertenece a otro paciente, mostramos acceso restringido genérico
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/app/documents"
              className="mr-1 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
              aria-label="Volver a documentos"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{document.name}</h1>
            <Badge variant="outline" className={getStatusBadgeClass(document.status)}>
              {getStatusLabel(document.status)}
            </Badge>
          </div>
          <p className="text-xs font-mono text-slate-500">ID Técnico: {document.id}</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <Button
            onClick={() => setIsHashDialogOpen(true)}
            variant="outline"
            className="inline-flex items-center gap-2 rounded-lg border-slate-200 bg-white hover:bg-slate-50"
          >
            <Hash className="size-4" />
            <span>Ver hash técnico</span>
          </Button>
          <Link
            to={`/app/documents/${document.id}/share`}
            className={buttonVariants({ variant: "default" }) + " inline-flex items-center gap-2 rounded-lg h-9 text-sm font-medium"}
          >
            <Share2 className="size-4" />
            <span>Compartir documento</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Technical info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Información técnica</CardTitle>
              <CardDescription>Detalles registrados del documento médico.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Propietario</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <UserRound className="size-4 text-slate-400" />
                  <span>{document.ownerName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoría</span>
                <p className="font-medium text-slate-700">{document.category}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de registro</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="size-4 text-slate-400" />
                  <span>{formatLongDate(document.uploadedAt)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Descripción</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                  {document.description}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hash técnico</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 break-all bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <Hash className="size-3.5 text-slate-400 shrink-0" />
                  <span>{document.documentHash}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mock PDF Viewer */}
        <div className="lg:col-span-2">
          <Card className="h-full border-slate-200 bg-white shadow-sm flex flex-col min-h-[400px]">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="size-5 text-slate-500" />
                <span>Vista previa del documento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
              <div className="rounded-full border border-slate-200 bg-white p-5 text-slate-400 shadow-sm mb-4">
                <FileText className="size-10" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                Vista previa no disponible en modo demostración
              </h3>
              <p className="max-w-md text-sm text-slate-500 mt-2 leading-relaxed">
                El PDF será solicitado al backend después de validar la autorización correspondiente.
              </p>
              <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50/75 p-3.5 text-xs text-sky-900 max-w-lg text-left">
                <Shield className="size-5 text-sky-700 shrink-0" />
                <p>
                  En la integración final, el backend entregará el documento al propietario autenticado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DocumentHashDialog
        open={isHashDialogOpen}
        document={document}
        onOpenChange={setIsHashDialogOpen}
      />
    </div>
  )
}

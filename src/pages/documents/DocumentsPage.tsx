import { useMemo, useState } from "react"
import { toast } from "sonner"

import { DocumentsEmptyState } from "@/components/documents/DocumentsEmptyState"
import { DocumentsFilters } from "@/components/documents/DocumentsFilters"
import { DocumentsHeader } from "@/components/documents/DocumentsHeader"
import { DocumentsStats } from "@/components/documents/DocumentsStats"
import { DocumentsList } from "@/components/documents/DocumentsList"
import { DocumentHashDialog } from "@/components/documents/DocumentHashDialog"
import { RegisterDocumentDialog } from "@/components/documents/RegisterDocumentDialog"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { useDemoSession } from "@/hooks/use-demo-session"
import {
  filterAndSortDocuments,
  getDocumentsStats,
  type DocumentFilters,
} from "@/utils/documents"
import type { MedicalDocument } from "@/types/document"

const initialFilters: DocumentFilters = {
  search: "",
  category: "ALL",
  status: "ALL",
  sort: "NEWEST",
}

export function DocumentsPage() {
  const { currentUser } = useDemoSession()
  const {
    documents,
    registerDocument,
  } = useDemoDocuments()

  const [filters, setFilters] = useState<DocumentFilters>(initialFilters)
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [selectedDocForHash, setSelectedDocForHash] = useState<MedicalDocument | null>(null)

  // Filter documents to only include those belonging to the active patient
  const patientDocuments = useMemo(() => {
    return documents.filter((doc) => doc.ownerId === currentUser.id)
  }, [documents, currentUser.id])

  const stats = useMemo(() => getDocumentsStats(patientDocuments), [patientDocuments])

  const filteredDocuments = useMemo(() => {
    return filterAndSortDocuments(patientDocuments, filters)
  }, [patientDocuments, filters])

  const handleRegister = (input: Omit<MedicalDocument, "id" | "uploadedAt" | "status">) => {
    const createdDoc = registerDocument(input)
    toast.success("Documento registrado en modo demostración.", {
      description: "El archivo seleccionado no se almacena. En la integración final será enviado al backend.",
    })
    return createdDoc
  }

  const handleClearFilters = () => setFilters(initialFilters)

  return (
    <div className="space-y-6">
      <DocumentsHeader onRegister={() => setIsRegisterDialogOpen(true)} />

      <DocumentsStats stats={stats} />

      <DocumentsFilters
        search={filters.search}
        category={filters.category}
        status={filters.status}
        sort={filters.sort}
        onSearchChange={(value) => setFilters((curr) => ({ ...curr, search: value }))}
        onCategoryChange={(value) => setFilters((curr) => ({ ...curr, category: value }))}
        onStatusChange={(value) => setFilters((curr) => ({ ...curr, status: value }))}
        onSortChange={(value) => setFilters((curr) => ({ ...curr, sort: value }))}
        onClearFilters={handleClearFilters}
      />

      {patientDocuments.length === 0 ? (
        <DocumentsEmptyState
          variant="empty"
          title="Todavía no tienes documentos registrados"
          description="Sube metadatos simulados de tu primer documento para comenzar."
          actionLabel="Registrar documento"
          onAction={() => setIsRegisterDialogOpen(true)}
        />
      ) : filteredDocuments.length === 0 ? (
        <DocumentsEmptyState
          variant="filtered"
          title="No se encontraron documentos"
          description="Prueba con otro nombre, identificador o categoría para encontrar tus archivos."
          actionLabel="Limpiar filtros"
          onAction={handleClearFilters}
        />
      ) : (
        <DocumentsList
          documents={filteredDocuments}
          onViewHash={(doc) => setSelectedDocForHash(doc)}
        />
      )}

      <RegisterDocumentDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        onRegister={handleRegister}
        currentUser={currentUser}
      />

      <DocumentHashDialog
        open={Boolean(selectedDocForHash)}
        document={selectedDocForHash}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDocForHash(null)
          }
        }}
      />
    </div>
  )
}

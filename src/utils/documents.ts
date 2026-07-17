import type { MedicalDocument, MedicalDocumentStatus } from "@/types/document"

export type DocumentCategoryFilter = string | "ALL"
export type DocumentStatusFilter = MedicalDocumentStatus | "ALL"
export type DocumentSortOrder = "NEWEST" | "OLDEST"

export interface DocumentFilters {
  search: string
  category: DocumentCategoryFilter
  status: DocumentStatusFilter
  sort: DocumentSortOrder
}

export interface DocumentStats {
  total: number
  active: number
  categoriesCount: number
  lastUploadedAt: string | null
}

// El filtrado del frontend no reemplaza la validación del backend.
export function normalizeSearch(text: string): string {
  return text.trim().toLowerCase()
}

export function filterAndSortDocuments(
  documents: readonly MedicalDocument[],
  filters: DocumentFilters,
): MedicalDocument[] {
  const searchTerm = normalizeSearch(filters.search)

  let result = documents.filter((doc) => {
    const matchesSearch =
      searchTerm.length === 0 ||
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.id.toLowerCase().includes(searchTerm)
    const matchesCategory = filters.category === "ALL" || doc.category === filters.category
    const matchesStatus = filters.status === "ALL" || doc.status === filters.status

    return matchesSearch && matchesCategory && matchesStatus
  })

  result.sort((a, b) => {
    const timeA = new Date(a.uploadedAt).getTime()
    const timeB = new Date(b.uploadedAt).getTime()
    return filters.sort === "NEWEST" ? timeB - timeA : timeA - timeB
  })

  return result
}

export function getDocumentsStats(documents: readonly MedicalDocument[]): DocumentStats {
  const activeDocs = documents.filter((doc) => doc.status === "ACTIVE")
  const uniqueCategories = new Set(documents.map((doc) => doc.category))
  
  let lastUploadedAt: string | null = null
  if (documents.length > 0) {
    const sorted = [...documents].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    lastUploadedAt = sorted[0].uploadedAt
  }

  return {
    total: documents.length,
    active: activeDocs.length,
    categoriesCount: uniqueCategories.size,
    lastUploadedAt,
  }
}

export function validateSelectedFile(file: File | null | undefined): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: "Debe seleccionar un archivo PDF." }
  }

  const isPdfMime = file.type === "application/pdf"
  const isPdfExtension = file.name.toLowerCase().endsWith(".pdf")

  if (!isPdfMime && !isPdfExtension) {
    return { isValid: false, error: "El archivo seleccionado debe ser en formato PDF." }
  }

  const maxSizeBytes = 10 * 1024 * 1024 // 10 MB
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: "El tamaño del archivo supera el límite permitido de 10 MB." }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// El hash generado en este modo no representa la integridad real del PDF.
export function generateMockHash(): string {
  const characters = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" // Base58 for IPFS style Qm... hashes
  let randomString = ""
  
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    for (let i = 0; i < array.length; i++) {
      randomString += characters[array[i] % characters.length]
    }
  } else {
    // Fallback safe pseudorandom generator
    for (let i = 0; i < 32; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length))
    }
  }

  return `QmDemo${randomString.slice(0, 26)}`
}

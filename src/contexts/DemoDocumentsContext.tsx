import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { demoDocuments } from "@/mocks/documents"
import type { MedicalDocument, MedicalDocumentStatus } from "@/types/document"

const DEMO_DOCUMENTS_STORAGE_KEY = "medirecord-demo-documents"

interface DemoDocumentsContextValue {
  documents: readonly MedicalDocument[]
  registerDocument: (document: Omit<MedicalDocument, "id" | "uploadedAt" | "status">) => MedicalDocument
  findDocumentById: (documentId: string) => MedicalDocument | undefined
  findDocumentsByOwnerId: (ownerId: string) => MedicalDocument[]
}

const DemoDocumentsContext = createContext<DemoDocumentsContextValue | null>(null)

const initialDocuments = demoDocuments.map((doc) => ({ ...doc }))

function isMedicalDocumentStatus(value: unknown): value is MedicalDocumentStatus {
  return value === "ACTIVE" || value === "ARCHIVED" || value === "RESTRICTED"
}

function isStoredDocumentRecord(value: unknown): value is MedicalDocument {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.category === "string" &&
    typeof record.description === "string" &&
    typeof record.ownerId === "string" &&
    typeof record.ownerName === "string" &&
    typeof record.documentHash === "string" &&
    typeof record.uploadedAt === "string" &&
    isMedicalDocumentStatus(record.status)
  )
}

function readStoredDocuments(): MedicalDocument[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.sessionStorage.getItem(DEMO_DOCUMENTS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isStoredDocumentRecord).map((doc) => ({ ...doc }))
  } catch {
    return []
  }
}

function writeStoredDocuments(documents: readonly MedicalDocument[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(DEMO_DOCUMENTS_STORAGE_KEY, JSON.stringify(documents))
}

function generateDemoDocumentId(): string {
  const randomSegment = Math.random().toString(36).slice(2, 8)
  return `doc-${Date.now().toString(36)}-${randomSegment}`
}

export function DemoDocumentsProvider({ children }: { children: ReactNode }) {
  const [sessionDocuments, setSessionDocuments] = useState<MedicalDocument[]>(() => readStoredDocuments())

  useEffect(() => {
    writeStoredDocuments(sessionDocuments)
  }, [sessionDocuments])

  const documents = useMemo(
    () => {
      const merged = [...initialDocuments]
      // Avoid duplicates from session storage if any
      sessionDocuments.forEach((sessionDoc) => {
        if (!merged.some((d) => d.id === sessionDoc.id)) {
          merged.push(sessionDoc)
        }
      })
      return merged
    },
    [sessionDocuments],
  )

  const findDocumentById = useCallback(
    (documentId: string) => documents.find((doc) => doc.id === documentId),
    [documents],
  )

  const findDocumentsByOwnerId = useCallback(
    (ownerId: string) => documents.filter((doc) => doc.ownerId === ownerId),
    [documents],
  )

  const registerDocument = useCallback(
    (input: Omit<MedicalDocument, "id" | "uploadedAt" | "status">) => {
      const nextDocument: MedicalDocument = {
        ...input,
        id: generateDemoDocumentId(),
        uploadedAt: new Date().toISOString(),
        status: "ACTIVE",
      }

      setSessionDocuments((currentDocs) => {
        const nextDocs = [...currentDocs, nextDocument]
        writeStoredDocuments(nextDocs)
        return nextDocs
      })

      return nextDocument
    },
    [],
  )

  const value = useMemo<DemoDocumentsContextValue>(
    () => ({
      documents,
      registerDocument,
      findDocumentById,
      findDocumentsByOwnerId,
    }),
    [documents, registerDocument, findDocumentById, findDocumentsByOwnerId],
  )

  return <DemoDocumentsContext.Provider value={value}>{children}</DemoDocumentsContext.Provider>
}

export { DemoDocumentsContext }

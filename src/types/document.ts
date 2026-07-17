export type MedicalDocumentStatus = "ACTIVE" | "ARCHIVED" | "RESTRICTED"

export interface MedicalDocument {
  id: string
  name: string
  category: string
  description: string
  ownerId: string
  ownerName: string
  documentHash: string
  uploadedAt: string
  status: MedicalDocumentStatus
}
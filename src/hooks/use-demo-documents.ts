import { useContext } from "react"

import { DemoDocumentsContext } from "@/contexts/DemoDocumentsContext"

export function useDemoDocuments() {
  const context = useContext(DemoDocumentsContext)

  if (!context) {
    throw new Error("useDemoDocuments debe usarse dentro de DemoDocumentsProvider.")
  }

  return context
}

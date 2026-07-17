import { useContext } from "react"

import { DemoAccessRecordsContext } from "@/contexts/DemoAccessRecordsContext"

export function useDemoAccessRecords() {
  const context = useContext(DemoAccessRecordsContext)

  if (!context) {
    throw new Error("useDemoAccessRecords debe usarse dentro de DemoAccessRecordsProvider.")
  }

  return context
}

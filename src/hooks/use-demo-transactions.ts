import { useContext } from "react"

import { DemoTransactionsContext } from "@/contexts/DemoTransactionsContext"

export function useDemoTransactions() {
  const context = useContext(DemoTransactionsContext)

  if (!context) {
    throw new Error("useDemoTransactions debe usarse dentro de DemoTransactionsProvider.")
  }

  return context
}

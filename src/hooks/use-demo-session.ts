import { useContext } from "react"

import { DemoSessionContext } from "@/contexts/DemoSessionContext"

export function useDemoSession() {
  const context = useContext(DemoSessionContext)

  if (!context) {
    throw new Error("useDemoSession debe usarse dentro de DemoSessionProvider.")
  }

  return context
}
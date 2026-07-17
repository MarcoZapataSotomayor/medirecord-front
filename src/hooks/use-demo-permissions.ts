import { useContext } from "react"

import { DemoPermissionsContext } from "@/contexts/DemoPermissionsContext"

export function useDemoPermissions() {
  const context = useContext(DemoPermissionsContext)

  if (!context) {
    throw new Error("useDemoPermissions debe usarse dentro de DemoPermissionsProvider.")
  }

  return context
}

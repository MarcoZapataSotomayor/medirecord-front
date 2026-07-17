import { useContext } from "react"

import { DemoParticipantsContext } from "@/contexts/DemoParticipantsContext"

export function useDemoParticipants() {
  const context = useContext(DemoParticipantsContext)

  if (!context) {
    throw new Error("useDemoParticipants debe usarse dentro de DemoParticipantsProvider.")
  }

  return context
}

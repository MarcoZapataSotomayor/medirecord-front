import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

import { AppState } from "@/components/feedback/AppState"
import { buttonVariants } from "@/components/ui/button"

export function AppNotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <AppState
        variant="warning"
        icon={ShieldAlert}
        title="Sección no encontrada"
        description="La sección solicitada no existe o no se encuentra disponible bajo tu rol de acceso actual."
        action={
          <Link
            to="/app/dashboard"
            className={buttonVariants({ variant: "default" }) + " rounded-lg text-xs"}
          >
            Volver al inicio
          </Link>
        }
      />
    </div>
  )
}
export default AppNotFoundPage

import { useLocation } from "react-router-dom"
import { Network, Wallet } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useDemoSession } from "@/hooks/use-demo-session"
import { abbreviateWalletAddress } from "@/utils/wallet"
import { RoleBadge } from "@/components/common/RoleBadge"
import { UserMenu } from "@/components/navigation/UserMenu"
import { getNavigationItemsForRole } from "@/config/navigation"

export function AppHeader() {
  const { currentUser, walletState, isConnected } = useDemoSession()
  const location = useLocation()
  
  let activeTitle = "Inicio"
  const path = location.pathname
  
  if (path.startsWith("/app/participants")) {
    activeTitle = "Participantes"
  } else if (path.startsWith("/app/documents")) {
    activeTitle = "Mis documentos"
  } else if (path.startsWith("/app/permissions")) {
    activeTitle = "Autorizaciones"
  } else if (path.startsWith("/app/authorized-documents")) {
    activeTitle = "Documentos Compartidos"
  } else if (path.startsWith("/app/activity")) {
    activeTitle = currentUser.role === "ADMIN" ? "Actividad del sistema" : "Historial"
  } else if (path.startsWith("/app/transactions")) {
    activeTitle = "Transacciones"
  } else if (path.startsWith("/app/profile")) {
    activeTitle = currentUser.role === "ADMIN" || currentUser.role === "PATIENT" || currentUser.role === "DOCTOR" ? "Perfil" : "Perfil institucional"
  } else if (path.startsWith("/app/settings")) {
    activeTitle = "Configuración"
  }

  const shortWallet = abbreviateWalletAddress(walletState.address)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <SidebarTrigger className="shrink-0 text-slate-700 dark:text-slate-200" />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Panel privado
          </p>
          <h1 className="truncate text-lg font-semibold text-slate-950 dark:text-slate-50 sm:text-xl">
            {activeTitle}
          </h1>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Network className="mr-1 size-3.5" aria-hidden="true" />
            Sepolia · {isConnected ? "Conectado" : "Pendiente"}
          </Badge>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350">
            <Wallet className="mr-1 size-3.5" aria-hidden="true" />
            {shortWallet || "Sin wallet"}
          </Badge>
        </div>

        <Separator orientation="vertical" className="hidden h-10 lg:block bg-slate-200 dark:bg-slate-800" />

        <div className="hidden min-w-0 flex-col items-end gap-1 xl:flex">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-200">{currentUser.fullName}</span>
            <RoleBadge role={currentUser.role} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{getNavigationItemsForRole(currentUser.role)[0]?.description ?? "Resumen privado"}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex lg:hidden bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Network className="mr-1 size-3.5" aria-hidden="true" />
            Sepolia · {isConnected ? "Conectado" : "Pendiente"}
          </Badge>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
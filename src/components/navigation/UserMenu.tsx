import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, LogOut, Settings2, UserRound } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDemoSession } from "@/hooks/use-demo-session"
import { abbreviateWalletAddress } from "@/utils/wallet"
import { cn } from "@/lib/utils"
import { RoleBadge } from "@/components/common/RoleBadge"

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { currentUser, walletState, disconnectDemoSession } = useDemoSession()

  const shortWallet = abbreviateWalletAddress(walletState.address)

  const handleLogout = () => {
    disconnectDemoSession()
    setOpen(false)
    navigate("/")
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="h-auto justify-between gap-3 rounded-2xl border-border bg-card px-3 py-2 text-left shadow-sm text-foreground"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">{currentUser.fullName}</span>
          <span className="truncate text-xs text-muted-foreground sm:max-w-40">{shortWallet || "Sin wallet"}</span>
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-popover p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] text-popover-foreground">
          <div className="space-y-3 border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-white">
                <UserRound className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{currentUser.fullName}</p>
                <p className="text-xs text-muted-foreground">{shortWallet || "Sin wallet"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <RoleBadge role={currentUser.role} />
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Sesión simulada
              </Badge>
            </div>
          </div>

          <div className="space-y-2 py-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate("/app/profile")
              }}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start text-slate-700")}
            >
              <UserRound className="size-4" aria-hidden="true" />
              Perfil
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate("/app/settings")
              }}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-start text-slate-700")}
            >
              <Settings2 className="size-4" aria-hidden="true" />
              Configuración
            </button>
          </div>

          <div className="pt-2">
            <Button type="button" variant="destructive" size="sm" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
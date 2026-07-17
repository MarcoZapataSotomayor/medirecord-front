import { Link, Outlet } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MediRecordLogo } from "@/components/branding/MediRecordLogo"
import { cn } from "@/lib/utils"

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.08),_transparent_38%),linear-gradient(180deg,_#f5f8fb_0%,_#eef4f8_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/" className="inline-flex w-fit items-center gap-3">
            <MediRecordLogo compact />
          </Link>

          <nav
            aria-label="Navegación principal"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <Link
              to="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-slate-700"
              )}
            >
              Inicio
            </Link>
            <Link
              to="/connect"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Conectar cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-medium text-slate-800">MediRecord</p>
            <p>Autorizaciones médicas verificables y experiencia pública de demostración.</p>
          </div>
          <Separator className="lg:hidden" />
          <p>Diseñado para la capa pública del frontend.</p>
        </div>
      </footer>
    </div>
  )
}
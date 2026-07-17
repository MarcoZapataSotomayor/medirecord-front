import { Link, Outlet } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDemoSession } from "@/hooks/use-demo-session"
import type { UserRole } from "@/types/user"

interface RoleRouteProps {
  allowedRoles: readonly UserRole[]
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { currentRole } = useDemoSession()

  // La protección visual de rutas no reemplaza las validaciones del Registry ni del backend.
  if (!allowedRoles.includes(currentRole)) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full border-rose-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-rose-950">Acceso restringido</CardTitle>
            <CardDescription>
              Tu cuenta no tiene permisos para acceder a este módulo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              La página a la que intentas ingresar está protegida según los roles configurados.
            </p>
            <Link
              to="/app/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Volver al inicio"
            >
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <Outlet />
}

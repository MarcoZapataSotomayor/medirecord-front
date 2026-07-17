import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState"
import type { Permission } from "@/types/permission"
import type { UserRole } from "@/types/user"
import { getEffectiveStatusLabel, formatExpiryLabel } from "@/utils/dashboard"
import { ShieldCheck } from "lucide-react"

interface PermissionSummaryProps {
  role: UserRole
  permissions: readonly Permission[]
}

export function PermissionSummary({ role, permissions }: PermissionSummaryProps) {
  const itemsToShow = permissions.slice(0, 4)

  if (itemsToShow.length === 0) {
    return (
      <DashboardEmptyState
        title="Sin autorizaciones para mostrar"
        description="Cuando existan autorizaciones relacionadas con esta cuenta, aparecerán aquí de forma resumida."
        icon={ShieldCheck}
      />
    )
  }

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-foreground">Autorizaciones</CardTitle>
        <CardDescription>
          {role === "PATIENT"
            ? "Últimas autorizaciones emitidas por tu cuenta."
            : role === "ADMIN"
              ? "Resumen técnico de credenciales y vigencias."
              : "Últimas autorizaciones recibidas por tu cuenta."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {itemsToShow.map((permission) => (
          <article key={permission.id} className="rounded-2xl border border-border bg-muted/30 dark:bg-slate-900/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-foreground">{permission.documentName}</h3>
                <p className="text-sm text-muted-foreground">{permission.authorizedUserName}</p>
              </div>
              <Badge
                variant={permission.status === "REVOKED" ? "destructive" : permission.status === "EXPIRED" ? "secondary" : "outline"}
                className={permission.status === "ACTIVE" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400" : permission.status === "EXPIRED" ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400" : ""}
              >
                {getEffectiveStatusLabel(permission.status)}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Credencial #{permission.tokenId}</span>
              <span aria-hidden="true">·</span>
              <span>{formatExpiryLabel(permission.expiresAt)}</span>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}

import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuickActionDefinition } from "@/config/dashboard-config"
import type { UserRole } from "@/types/user"

interface QuickActionCardProps {
  title: string
  description: string
  actions: readonly QuickActionDefinition[]
  currentRole: UserRole
}

export function QuickActionCard({ title, description, actions, currentRole }: QuickActionCardProps) {
  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon as LucideIcon
          const disabled = !action.enabled || !action.allowedRoles.includes(currentRole)

          return (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              disabled={disabled}
              className="h-auto min-h-28 flex-col items-start justify-start gap-3 rounded-2xl border-slate-200 bg-slate-50 p-4 text-left text-slate-700 shadow-none hover:bg-slate-50"
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {action.badge ?? "Próximamente"}
                </Badge>
              </span>
              <span className="space-y-1 text-left">
                <span className="block font-semibold text-slate-950">{action.title}</span>
                <span className="block text-sm leading-6 text-slate-600">{action.description}</span>
              </span>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
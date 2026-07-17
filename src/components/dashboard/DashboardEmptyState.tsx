import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardEmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  actionLabel?: string
}

export function DashboardEmptyState({
  title,
  description,
  icon: Icon,
  actionLabel = "Próximamente",
}: DashboardEmptyStateProps) {
  return (
    <Card className="border-dashed border-border bg-card/90 shadow-none text-card-foreground">
      <CardHeader className="space-y-3 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="mx-auto max-w-xl text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button type="button" variant="outline" disabled>
          <Badge variant="secondary" className="mr-2 bg-slate-100 text-slate-700">
            {actionLabel}
          </Badge>
          Acción deshabilitada
        </Button>
      </CardContent>
    </Card>
  )
}
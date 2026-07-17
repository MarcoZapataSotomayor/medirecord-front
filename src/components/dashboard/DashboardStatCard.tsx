import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardStatCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  secondaryText?: string
  variant?: "default" | "success" | "warning" | "danger"
}

const variantStyles: Record<NonNullable<DashboardStatCardProps["variant"]>, string> = {
  default: "border-border bg-card text-card-foreground",
  success: "border-emerald-250 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400",
  warning: "border-amber-250 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400",
  danger: "border-rose-250 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-450",
}

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  secondaryText,
  variant = "default",
}: DashboardStatCardProps) {
  return (
    <Card className={cn("shadow-sm", variantStyles[variant])}>
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardDescription className="text-muted-foreground">{title}</CardDescription>
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
        <CardTitle className="text-3xl text-foreground">{value}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        {secondaryText ? (
          <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
            {secondaryText}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  )
}
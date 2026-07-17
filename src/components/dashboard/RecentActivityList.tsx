import {
  Activity,
  CalendarClock,
  FileClock,
  FileText,
  ShieldCheck,
  UserRound,
  Stethoscope,
  AlertCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState"
import type { Activity as ActivityItem, ActivityType } from "@/types/activity"
import { formatRelativeDate, getActivityStatusLabel } from "@/utils/dashboard"

interface RecentActivityListProps {
  title: string
  description: string
  activities: readonly ActivityItem[]
  resolveRelatedLabel?: (activity: ActivityItem) => string | undefined
}

const activityIconMap: Record<ActivityType, typeof Activity> = {
  USER_REGISTERED: UserRound,
  DOCUMENT_REGISTERED: FileText,
  PERMISSION_ISSUED: ShieldCheck,
  PERMISSION_REVOKED: AlertCircle,
  PERMISSION_EXPIRED: CalendarClock,
  DOCUMENT_ACCESSED: FileClock,
  CONSULTATION_REGISTERED: Stethoscope,
}

export function RecentActivityList({
  title,
  description,
  activities,
  resolveRelatedLabel,
}: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <DashboardEmptyState
        title={title}
        description={description}
        icon={Activity}
        actionLabel="Sin actividad"
      />
    )
  }

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => {
          const Icon = activityIconMap[activity.type]

          return (
            <article key={activity.id} className="flex gap-3 rounded-2xl border border-border bg-muted/30 dark:bg-slate-900/50 p-4">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{activity.title}</h3>
                  {activity.status ? (
                    <Badge
                      variant={activity.status === "WARNING" ? "secondary" : "outline"}
                      className={activity.status === "WARNING" ? "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50" : activity.status === "SUCCESS" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50" : "bg-muted text-foreground"}
                    >
                      {getActivityStatusLabel(activity.status)}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{activity.description}</p>
                {resolveRelatedLabel?.(activity) ? (
                  <p className="text-xs font-medium text-muted-foreground">
                    Relacionado con: {resolveRelatedLabel(activity)}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.actorName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatRelativeDate(activity.occurredAt)}</span>
                </div>
              </div>
            </article>
          )
        })}
      </CardContent>
    </Card>
  )
}
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleBadge } from "@/components/common/RoleBadge"
import type { User } from "@/types/user"

interface DashboardWelcomeProps {
  user: User
  description: string
  privacyNotice: string
}

function getGreetingByHour(date: Date) {
  const hour = date.getHours()

  if (hour < 12) return "Buenos días"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

export function DashboardWelcome({ user, description, privacyNotice }: DashboardWelcomeProps) {
  const now = new Date()
  const formattedDate = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now)

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/20 dark:text-teal-400">
            Modo demostración
          </Badge>
          <RoleBadge role={user.role} />
        </div>
        <CardTitle className="text-2xl text-foreground sm:text-3xl">
          {getGreetingByHour(now)}, {user.fullName}
        </CardTitle>
        <CardDescription className="max-w-3xl text-base text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">{privacyNotice}</p>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Fecha actual · {formattedDate}
        </p>
      </CardContent>
    </Card>
  )
}
import type { ComponentType } from "react"
import { AlertCircle, CheckCircle2, Info, EyeOff } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type AppStateVariant = "info" | "warning" | "error" | "success" | "empty"

interface AppStateProps {
  variant: AppStateVariant
  icon?: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  techDetails?: string
  className?: string
}

export function AppState({
  variant,
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  techDetails,
  className = "",
}: AppStateProps) {
  const getDefaultIcon = () => {
    switch (variant) {
      case "success":
        return CheckCircle2
      case "error":
        return AlertCircle
      case "warning":
        return AlertCircle
      case "empty":
        return EyeOff
      default:
        return Info
    }
  };

  const IconComponent = CustomIcon || getDefaultIcon()

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          card: "border-emerald-200 bg-white",
          icon: "bg-emerald-50 text-emerald-800 border-emerald-100",
          title: "text-emerald-950",
        }
      case "error":
        return {
          card: "border-rose-200 bg-white",
          icon: "bg-rose-50 text-rose-800 border-rose-100",
          title: "text-rose-950",
        }
      case "warning":
        return {
          card: "border-amber-200 bg-white",
          icon: "bg-amber-50 text-amber-800 border-amber-100",
          title: "text-amber-950",
        }
      default:
        return {
          card: "border-slate-200 bg-white",
          icon: "bg-slate-50 text-slate-500 border-slate-100",
          title: "text-slate-900",
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={`mx-auto flex min-h-[400px] max-w-xl items-center justify-center p-4 ${className}`}>
      <Card className={`w-full text-center p-6 shadow-sm border ${styles.card}`}>
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <div className={`rounded-full border p-4 mb-2 shrink-0 ${styles.icon}`}>
            <IconComponent className="size-8" />
          </div>
          <CardTitle className={`text-base font-bold ${styles.title}`}>{title}</CardTitle>
          <CardDescription className="text-xs text-slate-500 max-w-sm">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {techDetails && (
            <code className="block font-mono text-[10px] text-left text-slate-500 bg-slate-50 p-2.5 border border-slate-100 rounded break-all max-h-24 overflow-y-auto">
              {techDetails}
            </code>
          )}
          {(action || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              {secondaryAction}
              {action}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

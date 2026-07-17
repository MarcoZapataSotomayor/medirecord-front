import { SearchX, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DocumentsEmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  variant: "empty" | "filtered"
}

export function DocumentsEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant,
}: DocumentsEmptyStateProps) {
  const Icon = variant === "filtered" ? SearchX : FileText

  return (
    <Card className="border-dashed border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

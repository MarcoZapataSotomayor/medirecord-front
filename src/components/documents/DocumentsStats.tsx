import { FileText, CheckCircle2, Folder, Calendar } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { DocumentStats } from "@/utils/documents"
import { formatRelativeDate } from "@/utils/dashboard"

interface DocumentsStatsProps {
  stats: DocumentStats
}

export function DocumentsStats({ stats }: DocumentsStatsProps) {
  const statsCards = [
    {
      key: "total",
      label: "Documentos totales",
      value: stats.total,
      description: "Todos los archivos registrados.",
      icon: FileText,
    },
    {
      key: "active",
      label: "Documentos activos",
      value: stats.active,
      description: "Disponibles para autorizaciones.",
      icon: CheckCircle2,
    },
    {
      key: "categories",
      label: "Categorías",
      value: stats.categoriesCount,
      description: "Tipos de documentos creados.",
      icon: Folder,
    },
    {
      key: "lastUploaded",
      label: "Último registro",
      value: stats.lastUploadedAt ? formatRelativeDate(stats.lastUploadedAt) : "N/A",
      description: "Fecha de la última subida.",
      icon: Calendar,
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statsCards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.key} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="text-xl font-semibold tracking-tight text-slate-950 truncate mt-1">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-normal">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

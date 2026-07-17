import { BriefcaseMedical, ShieldCheck, Users, UserRound } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { ParticipantStats } from "@/utils/participants"

interface ParticipantsStatsProps {
  stats: ParticipantStats
}

const statsCards = [
  {
    key: "total",
    label: "Total",
    description: "Incluye todos los roles registrados.",
    icon: Users,
  },
  {
    key: "patients",
    label: "Pacientes",
    description: "Participantes con rol PATIENT.",
    icon: UserRound,
  },
  {
    key: "doctors",
    label: "Médicos",
    description: "Participantes con rol DOCTOR.",
    icon: ShieldCheck,
  },
  {
    key: "institutions",
    label: "Entidades institucionales",
    description: "CLINIC e INSURANCE.",
    icon: BriefcaseMedical,
  },
] as const

export function ParticipantsStats({ stats }: ParticipantsStatsProps) {
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
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {stats[card.key]}
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-500">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

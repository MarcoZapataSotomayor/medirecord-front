import type { ReactNode } from "react"

import { Ban, CircleAlert, Network, UserX, Wallet } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type ConnectionErrorKind =
  | "METAMASK_NOT_INSTALLED"
  | "WRONG_NETWORK"
  | "UNREGISTERED_USER"
  | "CONNECTION_REJECTED"
  | "UNKNOWN_ERROR"

interface ConnectionErrorStateProps {
  kind: ConnectionErrorKind
  className?: string
}

const errorStateMap: Record<
  ConnectionErrorKind,
  {
    badge: string
    title: string
    description: string
    suggestion: string
    icon: ReactNode
  }
> = {
  METAMASK_NOT_INSTALLED: {
    badge: "MetaMask",
    title: "MetaMask no está instalada",
    description: "La demostración no puede avanzar porque falta la extensión del navegador.",
    suggestion: "Instala MetaMask para continuar con la validación de cuenta.",
    icon: <Wallet className="size-5" aria-hidden="true" />,
  },
  WRONG_NETWORK: {
    badge: "Red",
    title: "Red incorrecta",
    description: "La cuenta detectada no está conectada a Ethereum Sepolia.",
    suggestion: "Cambia la red antes de continuar con la simulación.",
    icon: <Network className="size-5" aria-hidden="true" />,
  },
  UNREGISTERED_USER: {
    badge: "Registro",
    title: "Usuario no registrado",
    description: "La cuenta existe en la wallet, pero aún no figura en el sistema de demostración.",
    suggestion: "Consulta al administrador para revisar el alta del participante.",
    icon: <UserX className="size-5" aria-hidden="true" />,
  },
  CONNECTION_REJECTED: {
    badge: "Conexión",
    title: "Conexión rechazada",
    description: "El usuario no aprobó el vínculo solicitado por la aplicación.",
    suggestion: "Vuelve a intentar cuando la cuenta esté disponible.",
    icon: <Ban className="size-5" aria-hidden="true" />,
  },
  UNKNOWN_ERROR: {
    badge: "Error",
    title: "Ocurrió un error desconocido",
    description: "La conexión simulada no pudo completarse por un problema no identificado.",
    suggestion: "Intenta nuevamente o revisa el estado de la demo.",
    icon: <CircleAlert className="size-5" aria-hidden="true" />,
  },
}

export function ConnectionErrorState({ kind, className }: ConnectionErrorStateProps) {
  const state = errorStateMap[kind]

  return (
    <Card className={cn("border-rose-200 bg-rose-50/80", className)}>
      <CardHeader className="pb-3">
        <Badge variant="destructive" className="w-fit">
          {state.badge}
        </Badge>
        <CardTitle className="mt-2 text-rose-950">{state.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-rose-900">
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-white/80 p-4">
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            {state.icon}
          </span>
          <div className="space-y-1">
            <p>{state.description}</p>
            <p className="font-medium">{state.suggestion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
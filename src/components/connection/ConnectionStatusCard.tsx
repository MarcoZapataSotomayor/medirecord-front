import type { ReactNode } from "react"

import { CheckCircle2, Loader2, ShieldCheck, Wallet } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { abbreviateWalletAddress } from "@/utils/wallet"
import type { WalletState } from "@/types/wallet"
import { cn } from "@/lib/utils"

interface ConnectionStatusCardProps {
  walletState: WalletState
  userName: string
  roleLabel: string
  connectionSteps: Array<{
    label: string
    completed: boolean
  }>
  onConnect: () => void
  onContinue?: () => void
  connectLabel: string
  connectDisabled?: boolean
  continueDisabled?: boolean
  continueLabel?: string
}

export function ConnectionStatusCard({
  walletState,
  userName,
  roleLabel,
  connectionSteps,
  onConnect,
  onContinue,
  connectLabel,
  connectDisabled = false,
  continueDisabled = true,
  continueLabel = "Continuar",
}: ConnectionStatusCardProps) {
  const isConnected = walletState.connectionStatus === "CONNECTED"
  const isConnecting = walletState.connectionStatus === "CONNECTING"
  const connectionBadge = isConnected
    ? "Conectada"
    : isConnecting
      ? "Conectando"
      : "Desconectada"

  const networkBadge = walletState.networkStatus === "SEPOLIA" ? "Ethereum Sepolia" : "Pendiente"

  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-slate-900">Estado de conexión</CardTitle>
            <CardDescription>
              Flujo simulado para revisar la cuenta digital y su contexto.
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : isConnecting ? "secondary" : "outline"}>
            {connectionBadge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusRow label="Estado de MetaMask" value={isConnected ? "Detectada" : isConnecting ? "Conectando" : "No conectada"} tone={isConnected ? "success" : isConnecting ? "warning" : "neutral"} icon={<Wallet className="size-4" aria-hidden="true" />} />
          <StatusRow label="Estado de red" value={networkBadge} tone={walletState.networkStatus === "SEPOLIA" ? "success" : "warning"} icon={<ShieldCheck className="size-4" aria-hidden="true" />} />
          <StatusRow label="Cuenta conectada" value={isConnected ? abbreviateWalletAddress(walletState.address) : "Sin conexión"} tone={isConnected ? "success" : "neutral"} icon={<CheckCircle2 className="size-4" aria-hidden="true" />} />
          <StatusRow label="Rol detectado" value={isConnected ? roleLabel : "Pendiente"} tone={isConnected ? "success" : "neutral"} icon={<ShieldCheck className="size-4" aria-hidden="true" />} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Cuenta simulada</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{userName}</p>
          <p className="text-sm text-slate-600">
            {isConnected
              ? "La validación pública queda lista para el siguiente bloque."
              : "La cuenta se resolverá cuando el usuario presione conectar."}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-800">Secuencia de conexión</p>
            {isConnecting ? (
              <span className="inline-flex items-center gap-2 text-sm text-amber-700">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Procesando
              </span>
            ) : null}
          </div>
          <ol className="grid gap-2 sm:grid-cols-2">
            {connectionSteps.map((step, index) => (
              <li
                key={step.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                  step.completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : index === 0
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-700"
                )}
              >
                <span className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  step.completed ? "bg-emerald-600 text-white" : index === 0 ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {index + 1}
                </span>
                {step.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onConnect} disabled={connectDisabled || isConnected} className="sm:flex-1">
            {connectLabel}
          </Button>
          <Button variant="outline" disabled={continueDisabled} onClick={onContinue} className="sm:flex-1">
            {continueLabel}
          </Button>
        </div>
        <p className="text-sm text-slate-500">El dashboard se habilitará en el siguiente bloque.</p>
      </CardContent>
    </Card>
  )
}

function StatusRow({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: string
  tone: "success" | "warning" | "neutral"
  icon: ReactNode
}) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-white text-slate-800"

  return (
    <div className={cn("rounded-xl border p-3", toneClasses)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  )
}
import { useCallback, useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Laptop2,
  UserCheck,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from "@/components/common/PageContainer"
import { ConnectionErrorState, type ConnectionErrorKind } from "@/components/connection/ConnectionErrorState"
import { ConnectionStatusCard } from "@/components/connection/ConnectionStatusCard"
import { useDemoSession } from "@/hooks/use-demo-session"
import { cn } from "@/lib/utils"

const connectionSteps = [
  "Detectar MetaMask.",
  "Conectar cuenta.",
  "Validar red.",
  "Consultar rol.",
]

const demoErrorKinds: Array<{ label: string; kind: ConnectionErrorKind }> = [
  { label: "MetaMask no instalada", kind: "METAMASK_NOT_INSTALLED" },
  { label: "Red incorrecta", kind: "WRONG_NETWORK" },
  { label: "Usuario no registrado", kind: "UNREGISTERED_USER" },
  { label: "Conexión rechazada", kind: "CONNECTION_REJECTED" },
  { label: "Error desconocido", kind: "UNKNOWN_ERROR" },
]

export function ConnectPage() {
  const navigate = useNavigate()
  const { currentUser, walletState, isConnected, connectDemoUser } = useDemoSession()
  const [isConnecting, setIsConnecting] = useState(false)
  const [demoErrorKind, setDemoErrorKind] = useState<ConnectionErrorKind>("METAMASK_NOT_INSTALLED")

  const handleConnect = useCallback(() => {
    if (isConnecting) {
      return
    }

    setIsConnecting(true)
    connectDemoUser(currentUser.id)
    setIsConnecting(false)
  }, [connectDemoUser, currentUser.id, isConnecting])

  const handleContinue = useCallback(() => {
    if (!isConnected) {
      return
    }

    navigate("/app/dashboard")
  }, [isConnected, navigate])

  const shortAddress = walletState.address
    ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
    : ""

  const connectionStepState = connectionSteps.map((label, index) => ({
    label,
    completed: isConnected || (isConnecting && index === 0),
  }))

  return (
    <PageContainer className="space-y-8 py-12 sm:py-16">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-start">
        <div className="space-y-4">
          <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
            Pantalla de conexión simulada
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Conecta tu cuenta digital para continuar
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Esta vista prepara la validación pública de MetaMask, la red y el rol detectado
            antes de habilitar el área privada del producto.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatusChip
              icon={<Wallet className="size-4" aria-hidden="true" />}
              label="Estado de MetaMask"
              value={isConnected ? "Detectada" : isConnecting ? "Conectando" : "Desconectada"}
              tone={isConnected || isConnecting ? "success" : "neutral"}
            />
            <StatusChip
              icon={<Laptop2 className="size-4" aria-hidden="true" />}
              label="Estado de red"
              value={isConnected ? "Ethereum Sepolia" : "Pendiente"}
              tone={isConnected ? "success" : "warning"}
            />
            <StatusChip
              icon={<UserCheck className="size-4" aria-hidden="true" />}
              label="Rol detectado"
              value={isConnected ? currentUser.role === "PATIENT" ? "Paciente" : currentUser.role : "Pendiente"}
              tone={isConnected ? "success" : "neutral"}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver al inicio
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <ConnectionStatusCard
            walletState={walletState}
            userName={currentUser.fullName}
            roleLabel={currentUser.role === "PATIENT" ? "Paciente" : currentUser.role}
            connectionSteps={connectionStepState}
            onConnect={handleConnect}
            onContinue={handleContinue}
            connectLabel={isConnected ? "Cuenta conectada" : isConnecting ? "Conectando..." : "Conectar cuenta"}
            connectDisabled={isConnecting}
            continueDisabled={!isConnected}
          />

          <Card className="border-slate-200/80 bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900">Resumen de demostración</CardTitle>
              <CardDescription>
                Cuenta simulada y contexto coherente con los datos de prueba existentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <SummaryPill label="Nombre simulado" value={currentUser.fullName} />
              <SummaryPill label="Cuenta conectada" value={shortAddress || "Sin conexión"} />
              <SummaryPill label="Usuario registrado" value={isConnected ? "Sí" : "No"} />
              <SummaryPill label="Red" value={isConnected ? "Ethereum Sepolia" : "Pendiente"} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-slate-900">Secuencia visual</CardTitle>
            <CardDescription>
              Cada paso se muestra en orden para explicar el proceso al usuario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 md:grid-cols-2">
              {connectionStepState.map((step, index) => {
                const completed = step.completed

                return (
                  <li
                    key={step.label}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                      completed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : index === 0
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : "border-slate-200 bg-slate-50 text-slate-700",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                        completed
                          ? "bg-emerald-600 text-white"
                          : index === 0
                            ? "bg-amber-600 text-white"
                            : "bg-slate-200 text-slate-600",
                      )}
                    >
                      {index + 1}
                    </span>
                    <span>{step.label}</span>
                    {completed ? <CheckCircle2 className="ml-auto size-4" aria-hidden="true" /> : null}
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-slate-900">Vista de demostración</CardTitle>
            <CardDescription>
              Casos de error visibles sin integraciones reales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                Vista de demostración
              </summary>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {demoErrorKinds.map((error) => (
                    <Button
                      key={error.kind}
                      type="button"
                      variant={demoErrorKind === error.kind ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDemoErrorKind(error.kind)}
                    >
                      {error.label}
                    </Button>
                  ))}
                </div>
                <ConnectionErrorState kind={demoErrorKind} />
                <p className="text-sm text-slate-500">
                  Los mensajes solo ilustran el comportamiento público de la pantalla.
                </p>
              </div>
            </details>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">Acciones finales</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Button type="button" className="sm:flex-1" disabled={!isConnected} onClick={handleContinue}>
                  Continuar
                </Button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 sm:flex-1"
                >
                  Volver al inicio
                </Link>
              </div>
              <p className="mt-3 text-sm text-slate-500">El dashboard se habilitará en el siguiente bloque.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  )
}

function StatusChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: "success" | "warning" | "neutral"
}) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-white text-slate-800"

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", toneClasses)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] opacity-80">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

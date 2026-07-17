import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ParticipantsHeaderProps {
  onRegister: () => void
}

export function ParticipantsHeader({ onRegister }: ParticipantsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Modo demostración
          </Badge>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
            Administración
          </Badge>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Participantes</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Consulta participantes registrados, aplica filtros y registra cuentas simuladas.
            Registrar un participante no concede acceso médico ni sustituye la validación real.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
        <p className="max-w-md text-sm leading-6 text-slate-500">
          En la integración final esta operación requerirá confirmación mediante MetaMask y Sepolia ETH.
        </p>
        <Button type="button" onClick={onRegister} className="w-full sm:w-auto sm:shrink-0">
          Registrar participante
        </Button>
      </div>
    </div>
  )
}

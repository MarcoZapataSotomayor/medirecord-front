import { useDemoSession } from "@/hooks/use-demo-session"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RoleBadge } from "@/components/common/RoleBadge"

export function DemoUserSwitcher() {
  const { availableUsers, currentUser, switchDemoUser } = useDemoSession()

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-3 text-slate-700 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Modo demostración</p>
          <p className="text-xs leading-5 text-slate-500">
            Reemplazo temporal de MetaMask para alternar cuentas simuladas.
          </p>
        </div>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          Demo
        </Badge>
      </div>

      <Select
        value={currentUser.id}
        onValueChange={(value) => {
          if (value) {
            switchDemoUser(value)
          }
        }}
      >
        <SelectTrigger className="w-full bg-slate-50">
          <SelectValue placeholder="Selecciona un usuario" />
        </SelectTrigger>
        <SelectContent>
          {availableUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <span className="flex w-full items-center justify-between gap-3">
                <span className="flex flex-col items-start text-left">
                  <span className="font-medium text-slate-900">{user.fullName}</span>
                  <span className="text-xs text-slate-500">Se mostrará su cuenta y rol en el panel</span>
                </span>
                <span className="shrink-0">
                  <RoleBadge role={user.role} />
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="text-xs leading-5 text-slate-500">
        Este selector solo mueve la demostración actual y será reemplazado por MetaMask.
      </p>
    </div>
  )
}
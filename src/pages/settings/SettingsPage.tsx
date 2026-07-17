import { useState, useMemo } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, LogOut, RefreshCw, AlertTriangle, Network, Globe } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDemoSession } from "@/hooks/use-demo-session"
import { abbreviateWalletAddress } from "@/utils/wallet"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { currentUser, disconnectDemoSession } = useDemoSession()
  const navigate = useNavigate()

  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)

  const handleLogout = () => {
    disconnectDemoSession()
    toast.success("Sesión cerrada.", {
      description: "Se ha cerrado la sesión de demostración actual."
    })
    navigate("/")
  }

  const handleResetData = () => {
    // Reset all storage keys
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("medirecord-demo-transactions")
      window.sessionStorage.removeItem("medirecord-demo-access-records")
      window.sessionStorage.removeItem("medirecord-demo-permissions")
      window.sessionStorage.removeItem("medirecord-demo-documents")
      window.sessionStorage.removeItem("medirecord-demo-participants")
      window.sessionStorage.removeItem("medirecord-demo-session")
    }

    toast.success("Datos restablecidos.", {
      description: "Se limpiaron los datos de la sesión."
    })
    setIsResetOpen(false)
    navigate("/")
    window.location.reload()
  }

  const currentThemeLabel = useMemo(() => {
    if (theme === "light") return "Claro"
    if (theme === "dark") return "Oscuro"
    return "Tema del sistema"
  }, [theme])

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-foreground">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">Configuración</h1>
          <Badge variant="outline" className="border-border bg-muted text-foreground">
            Modo demostración
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Administra la apariencia, verifica la red Sepolia y controla el estado de la sesión.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Theme Selector */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Apariencia de la aplicación
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Cambia el tema de color visual (Tema actual: {currentThemeLabel}).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2.5">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="text-xs flex items-center justify-center gap-1.5 h-9"
              >
                <Sun className="size-3.5" />
                <span>Claro</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="text-xs flex items-center justify-center gap-1.5 h-9"
              >
                <Moon className="size-3.5" />
                <span>Oscuro</span>
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="text-xs flex items-center justify-center gap-1.5 h-9"
              >
                <Laptop className="size-3.5" />
                <span>Sistema</span>
              </Button>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Cuenta de sesión
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Información del usuario activo y controles de cierre de sesión.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Usuario</span>
                <span className="font-semibold text-foreground">{currentUser.fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Rol activo</span>
                <Badge variant="outline" className="border-border bg-muted text-foreground text-[10px] py-0">
                  {currentUser.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Wallet</span>
                <span className="font-mono text-muted-foreground">{abbreviateWalletAddress(currentUser.walletAddress)}</span>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => setIsLogoutOpen(true)}
                  variant="destructive"
                  className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 h-9 rounded-lg"
                >
                  <LogOut className="size-3.5" />
                  <span>Desconectar cuenta</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Box */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Política de Privacidad Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
              <p>
                <strong>Archivos PDF:</strong> Los documentos y registros clínicos se almacenan fuera de la blockchain en el backend de MediRecord. La red distribuida no almacena datos de salud sensibles.
              </p>
              <p>
                <strong>Trazabilidad:</strong> Los contratos inteligentes registrados en Ethereum Sepolia administran únicamente los estados hash criptográficos, identificadores de dirección wallet y tokens de permisos (NFTs).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Network Connection Info */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-foreground">
                <Network className="size-4 text-blue-600 dark:text-blue-400" />
                <span>Información de red</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Red esperada</span>
                <span className="font-semibold text-foreground">Ethereum Sepolia Testnet</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Chain ID</span>
                <code className="font-mono text-foreground">11155111</code>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant="outline" className="border-sky-250 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20 text-sky-800 dark:text-sky-400 text-[10px] py-0">
                  Simulado
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal pt-1">
                La red real y la conexión wallet se comprobarán dinámicamente mediante el proveedor MetaMask inyectado en el navegador durante la fase de producción.
              </p>
            </CardContent>
          </Card>

          {/* Contracts Info */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 text-foreground">
                <Globe className="size-4 text-blue-600 dark:text-blue-400" />
                <span>Contratos desplegados</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground font-mono">MediRecordRegistry</span>
                <span className="font-medium text-muted-foreground italic">Pendiente de configuración</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground font-mono">MedicalAccessNFT</span>
                <span className="font-medium text-muted-foreground italic">Uso interno del Registry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado de contratos</span>
                <Badge variant="outline" className="border-rose-300 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-450 text-[10px] py-0">
                  No conectado
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Reset Demo Data */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-rose-950 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="size-4 text-rose-600 animate-spin-hover" />
                <span>Demostración y pruebas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                ¿Deseas borrar los registros de auditoría local, los nuevos documentos subidos y los permisos emitidos en este navegador?
              </p>
              <Button
                onClick={() => setIsResetOpen(true)}
                variant="outline"
                className="w-full text-xs font-semibold text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-800 dark:hover:text-rose-400 h-9"
              >
                Restablecer datos de demostración
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="max-w-sm bg-card border border-border shadow-lg rounded-lg p-5 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">Desconectar cuenta</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Se cerrará la sesión de demostración actual. Podrás volver a ingresar seleccionando cualquiera de las cuentas de demostración.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setIsLogoutOpen(false)} className="text-xs">
              Cancelar
            </Button>
            <Button size="sm" variant="destructive" onClick={handleLogout} className="text-xs font-semibold">
              Desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="max-w-sm bg-card border border-border shadow-lg rounded-lg p-5 text-foreground">
          <DialogHeader className="flex flex-col items-center gap-1.5 text-center">
            <div className="rounded-full bg-rose-50/50 dark:bg-rose-950/20 p-3 text-rose-800 dark:text-rose-400 mb-1 border border-rose-100 dark:border-rose-900">
              <AlertTriangle className="size-6" />
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">¿Restablecer todos los datos?</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Esta acción eliminará de forma irreversible las autorizaciones emitidas, documentos subidos, accesos auditados y transacciones simuladas almacenadas en la sesión de este navegador.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setIsResetOpen(false)} className="text-xs">
              Cancelar
            </Button>
            <Button size="sm" variant="destructive" onClick={handleResetData} className="text-xs font-semibold">
              Confirmar restablecimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

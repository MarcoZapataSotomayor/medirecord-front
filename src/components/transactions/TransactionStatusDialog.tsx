import { useState, useEffect, useRef } from "react"
import { Loader2, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { TransactionStatus, TransactionRecord } from "@/types/transaction"
import { createMockTransactionRecord } from "@/utils/permissions"

interface TransactionStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionName: string
  onConfirmed: (txRecord: TransactionRecord) => void
  onRejected?: () => void
}

export function TransactionStatusDialog({
  open,
  onOpenChange,
  actionName,
  onConfirmed,
  onRejected,
}: TransactionStatusDialogProps) {
  const [status, setStatus] = useState<TransactionStatus>("AWAITING_SIGNATURE")
  const [txRecord, setTxRecord] = useState<TransactionRecord | null>(null)
  
  const timerRef1 = useRef<any>(null)
  const timerRef2 = useRef<any>(null)

  useEffect(() => {
    if (open) {
      setStatus("AWAITING_SIGNATURE")
      setTxRecord(createMockTransactionRecord(actionName, "AWAITING_SIGNATURE"))
    } else {
      // Clear timers when dialog is closed
      if (timerRef1.current) clearTimeout(timerRef1.current)
      if (timerRef2.current) clearTimeout(timerRef2.current)
    }
  }, [open, actionName])

  const handleConfirmSimulation = () => {
    setStatus("SUBMITTED")
    const subRecord = createMockTransactionRecord(actionName, "SUBMITTED")
    setTxRecord(subRecord)

    // Simulate block submission delay
    timerRef1.current = setTimeout(() => {
      setStatus("CONFIRMING")
      const confRecord = createMockTransactionRecord(actionName, "CONFIRMING", subRecord.transactionHash)
      setTxRecord(confRecord)

      // Simulate block confirmation delay
      timerRef2.current = setTimeout(() => {
        setStatus("CONFIRMED")
        const finalRecord = createMockTransactionRecord(actionName, "CONFIRMED", subRecord.transactionHash)
        setTxRecord(finalRecord)
        onConfirmed(finalRecord)
      }, 1200)
    }, 1200)
  }

  const handleRejectSimulation = () => {
    setStatus("REJECTED")
    const rejRecord = createMockTransactionRecord(actionName, "REJECTED")
    setTxRecord(rejRecord)
    if (onRejected) {
      onRejected()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Prevent closing while transaction is in progress
      if (status === "SUBMITTED" || status === "CONFIRMING") {
        return
      }
      onOpenChange(val)
    }}>
      <DialogContent className="max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Operación: {actionName}</span>
          </DialogTitle>
          <DialogDescription>
            Trazabilidad técnica de la firma digital de demostración.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {status === "AWAITING_SIGNATURE" && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-600 animate-pulse">
                <ShieldAlert className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Firma requerida (Simulada)</h3>
                <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
                  En la integración final, MetaMask solicitará tu firma digital para autorizar la transacción en Sepolia.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" size="sm" onClick={handleRejectSimulation}>
                  Rechazar simulación
                </Button>
                <Button size="sm" onClick={handleConfirmSimulation}>
                  Confirmar simulación
                </Button>
              </div>
            </div>
          )}

          {(status === "SUBMITTED" || status === "CONFIRMING") && (
            <div className="space-y-4 text-center py-6">
              <Loader2 className="mx-auto size-8 text-sky-600 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  {status === "SUBMITTED" ? "Enviando transacción..." : "Confirmando bloque..."}
                </h3>
                <p className="text-xs text-slate-400">
                  Procesando firma técnica simulada...
                </p>
              </div>
            </div>
          )}

          {status === "CONFIRMED" && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 mt-2">Transacción Confirmada</h3>
                <p className="text-xs text-slate-500 mt-1">Operación realizada con éxito.</p>
              </div>

              {txRecord && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Código de transacción</span>
                    <span className="font-mono text-slate-700">{txRecord.transactionHash?.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bloque simulado</span>
                    <span className="font-mono text-slate-700">#{txRecord.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gas utilizado</span>
                    <span className="font-mono text-slate-700">{txRecord.gasUsed} unidades</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800 text-[10px]">
                      Simulado
                    </Badge>
                    <span className="text-[10px] text-slate-400">No enviado a Ethereum Sepolia</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button disabled variant="outline" size="sm" className="opacity-50 cursor-not-allowed text-[10px]">
                  Ver en Sepolia Etherscan (Próximamente)
                </Button>
                <Button size="sm" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="space-y-4 text-center py-4">
              <XCircle className="mx-auto size-10 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900 mt-2">Simulación Rechazada</h3>
              <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
                No se crearon ni modificaron autorizaciones.
              </p>
              <div className="pt-2">
                <Button size="sm" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}

          {status === "FAILED" && (
            <div className="space-y-4 text-center py-4">
              <AlertCircle className="mx-auto size-10 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900 mt-2">Error de Transacción</h3>
              <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
                Fallo al firmar o procesar la simulación.
              </p>
              <div className="pt-2">
                <Button size="sm" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

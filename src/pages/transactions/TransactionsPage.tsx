import { useMemo, useState } from "react"
import { Search, Info, ExternalLink, Cpu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoTransactions } from "@/hooks/use-demo-transactions"
import { filterAndSortTransactions } from "@/utils/transaction-history"
import { abbreviateHash } from "@/utils/activity-history"
import type { TransactionHistoryEntry, OperationType } from "@/types/transaction-history"

export function TransactionsPage() {
  const { currentUser } = useDemoSession()
  const { transactions } = useDemoTransactions()

  const [searchText, setSearchText] = useState("")
  const [opType, setOpType] = useState<OperationType | "ALL">("ALL")
  const [sortOrder, setSortOrder] = useState<"DESC" | "ASC">("DESC")
  const [selectedTx, setSelectedTx] = useState<TransactionHistoryEntry | null>(null)

  const filteredTx = useMemo(() => {
    return filterAndSortTransactions(transactions, currentUser.role, currentUser.id, {
      search: searchText,
      operationType: opType,
      sortOrder,
    })
  }, [transactions, currentUser.role, currentUser.id, searchText, opType, sortOrder])

  const stats = useMemo(() => {
    const total = filteredTx.length
    const confirmed = filteredTx.filter((t) => t.status === "CONFIRMED").length
    const lastOp = filteredTx[0]?.operationLabel || "Ninguna"
    return { total, confirmed, lastOp }
  }, [filteredTx])

  const handleClearFilters = () => {
    setSearchText("")
    setOpType("ALL")
    setSortOrder("DESC")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Transacciones</h1>
          <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800">
            Modo demostración
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Consulta las operaciones simuladas registradas durante esta sesión de demostración.
        </p>
      </div>

      {/* Sepolia Alert */}
      <Card className="border-amber-200 bg-amber-50/50 p-4 flex gap-3 text-xs text-amber-900 leading-relaxed rounded-lg">
        <Info className="size-4 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Aviso de Simulación Técnica</p>
          <p>
            Estas operaciones no fueron enviadas a la red de pruebas Ethereum Sepolia. El frontend calcula y renderiza hashes, firmas y bloques ficticios para demostrar el flujo de trazabilidad.
          </p>
        </div>
      </Card>

      {/* Stats */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Transacciones simuladas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Confirmadas</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.confirmed}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Última operación</p>
          <p className="text-sm font-semibold text-slate-800 mt-2.5 truncate" title={stats.lastOp}>
            {stats.lastOp}
          </p>
        </Card>
      </section>

      {/* Filters */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,0.75fr))_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="tx-search" className="text-sm font-medium text-slate-700">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="tx-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por Tx Hash, documento o ID..."
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="tx-type" className="text-sm font-medium text-slate-700">
              Operación
            </label>
            <Select value={opType} onValueChange={(val) => { if (val) setOpType(val as any) }}>
              <SelectTrigger id="tx-type" className="bg-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las operaciones</SelectItem>
                <SelectItem value="PERMISSION_ISSUED">Emisión de autorización</SelectItem>
                <SelectItem value="PERMISSION_REVOKED">Revocación de autorización</SelectItem>
                <SelectItem value="MEDICAL_CONSULTATION_REGISTERED">Consulta clínica</SelectItem>
                <SelectItem value="INSTITUTIONAL_ACCESS_REGISTERED">Acceso institucional</SelectItem>
                <SelectItem value="COVERAGE_VERIFICATION_REGISTERED">Verificación de cobertura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="tx-sort" className="text-sm font-medium text-slate-700">
              Orden
            </label>
            <Select value={sortOrder} onValueChange={(val) => { if (val) setSortOrder(val as any) }}>
              <SelectTrigger id="tx-sort" className="bg-white">
                <SelectValue placeholder="Más recientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Más recientes</SelectItem>
                <SelectItem value="ASC">Más antiguos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button type="button" variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List Table */}
      {filteredTx.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white shadow-sm p-12 text-center flex flex-col items-center gap-4">
          <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500">
            <Cpu className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">No hay transacciones registradas</h2>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed mx-auto">
              Las operaciones técnicas realizadas con MetaMask simulado se reflejarán de manera detallada en esta tabla.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Operación</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Actor / Cuenta</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Fecha y Hora</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Bloque</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Tx Hash</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 text-right">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTx.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50 transition border-b border-slate-100 last:border-0">
                    <TableCell className="py-3 font-semibold text-slate-900 text-xs">{tx.operationLabel}</TableCell>
                    <TableCell className="py-3 text-xs text-slate-600">
                      <div>{tx.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.actorRole}</div>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-slate-500">
                      <div>{new Date(tx.occurredAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(tx.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-slate-600">#{tx.blockNumber}</TableCell>
                    <TableCell className="py-3 font-mono text-xs text-slate-500">{abbreviateHash(tx.transactionHash)}</TableCell>
                    <TableCell className="py-3 text-xs">
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] py-0">
                        Simulado
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedTx(tx)} className="text-xs h-7">
                        Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => { if (!open) setSelectedTx(null) }}>
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-lg rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Detalles de la Transacción</DialogTitle>
            <DialogDescription className="text-xs">Parámetros técnicos de auditoría descentralizada.</DialogDescription>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400">Operación</span>
                <span className="col-span-2 font-semibold text-slate-900">{selectedTx.operationLabel}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400">Actor</span>
                <span className="col-span-2 text-slate-700">
                  {selectedTx.actorName} ({selectedTx.actorRole})
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400">Fecha y Hora</span>
                <span className="col-span-2 text-slate-700">
                  {new Date(selectedTx.occurredAt).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-mono">Tx Hash</span>
                <code className="col-span-2 font-mono text-[10px] text-slate-600 block bg-slate-50 p-1 border border-slate-100 rounded truncate" title={selectedTx.transactionHash}>
                  {selectedTx.transactionHash}
                </code>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-mono">Bloque</span>
                <span className="col-span-2 font-mono text-slate-700">#{selectedTx.blockNumber}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-mono">Gas consumido</span>
                <span className="col-span-2 font-mono text-slate-700">{selectedTx.gasUsed} gas</span>
              </div>
              {selectedTx.relatedDocumentId && (
                <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-mono">Doc ID</span>
                  <span className="col-span-2 font-mono text-slate-700">{selectedTx.relatedDocumentId}</span>
                </div>
              )}
              {selectedTx.relatedPermissionId && (
                <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                  <span className="text-slate-400 font-mono">Permit ID</span>
                  <span className="col-span-2 font-mono text-slate-700">{selectedTx.relatedPermissionId}</span>
                </div>
              )}

              <div className="pt-2">
                <Card className="border-sky-200 bg-sky-50/50 p-2.5 flex gap-2 text-[10px] text-sky-900 leading-normal rounded">
                  <Info className="size-3.5 text-sky-800 shrink-0 mt-0.5" />
                  <p>
                    Esta operación se procesó mediante el simulador local de MediRecord y posee fines ilustrativos.
                  </p>
                </Card>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button disabled className="w-full text-xs font-medium justify-center gap-1.5 h-8">
                  <span>Ver en Sepolia Etherscan</span>
                  <ExternalLink className="size-3" />
                </Button>
                <p className="text-[9px] text-slate-400 text-center">
                  Disponible cuando la operación se realice en la red real.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

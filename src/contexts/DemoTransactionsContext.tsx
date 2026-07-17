import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { TransactionHistoryEntry, OperationType } from "@/types/transaction-history"
import { demoPermissions } from "@/mocks/permissions"
import { demoAccessRecords } from "@/mocks/access-records"

const DEMO_TRANSACTIONS_STORAGE_KEY = "medirecord-demo-transactions"

interface DemoTransactionsContextValue {
  transactions: readonly TransactionHistoryEntry[]
  registerTransaction: (entry: Omit<TransactionHistoryEntry, "id" | "occurredAt" | "simulated">) => TransactionHistoryEntry
  findTransactionsByActorId: (actorId: string) => TransactionHistoryEntry[]
  findTransactionsByDocumentId: (documentId: string) => TransactionHistoryEntry[]
  findTransactionsByPermissionId: (permissionId: string) => TransactionHistoryEntry[]
  resetDemoTransactions: () => void
}

const DemoTransactionsContext = createContext<DemoTransactionsContextValue | null>(null)

// Seed initial technical transaction entries from mock permissions and mock access logs
const initialTransactions: TransactionHistoryEntry[] = []

demoPermissions.forEach((perm) => {
  // Issuance
  initialTransactions.push({
    id: `tx-init-iss-${perm.id}`,
    actorId: perm.patientId,
    actorName: perm.patientName,
    actorRole: "PATIENT",
    operationType: "PERMISSION_ISSUED",
    operationLabel: "Emisión de autorización",
    relatedDocumentId: perm.documentId,
    relatedPermissionId: perm.id,
    transactionHash: perm.transactionHash,
    blockNumber: 5900000 + Math.floor(Math.random() * 50000),
    gasUsed: "86,210",
    status: "CONFIRMED",
    occurredAt: perm.issuedAt,
    simulated: true,
  })

  // Revocation
  if (perm.status === "REVOKED") {
    initialTransactions.push({
      id: `tx-init-rev-${perm.id}`,
      actorId: perm.patientId,
      actorName: perm.patientName,
      actorRole: "PATIENT",
      operationType: "PERMISSION_REVOKED",
      operationLabel: "Revocación de autorización",
      relatedDocumentId: perm.documentId,
      relatedPermissionId: perm.id,
      transactionHash: `0xrevhash${perm.tokenId}`,
      blockNumber: 5960000 + Math.floor(Math.random() * 50000),
      gasUsed: "45,124",
      status: "CONFIRMED",
      occurredAt: new Date(new Date(perm.issuedAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      simulated: true,
    })
  }
})

demoAccessRecords.forEach((rec) => {
  let operationType: OperationType = "MEDICAL_CONSULTATION_REGISTERED"
  let operationLabel = "Registro de consulta médica"

  if (rec.actorRole === "CLINIC") {
    operationType = "INSTITUTIONAL_ACCESS_REGISTERED"
    operationLabel = "Registro de acceso institucional"
  } else if (rec.actorRole === "INSURANCE") {
    operationType = "COVERAGE_VERIFICATION_REGISTERED"
    operationLabel = "Registro de verificación de cobertura"
  }

  initialTransactions.push({
    id: `tx-init-acc-${rec.id}`,
    actorId: rec.actorId,
    actorName: rec.actorName,
    actorRole: rec.actorRole,
    operationType,
    operationLabel,
    relatedDocumentId: rec.documentId,
    relatedPermissionId: rec.permissionId,
    transactionHash: rec.transactionHash,
    blockNumber: rec.blockNumber,
    gasUsed: rec.gasUsed,
    status: "CONFIRMED",
    occurredAt: rec.occurredAt,
    simulated: true,
  })
})

function isOperationType(value: unknown): value is OperationType {
  return (
    value === "PERMISSION_ISSUED" ||
    value === "PERMISSION_REVOKED" ||
    value === "MEDICAL_CONSULTATION_REGISTERED" ||
    value === "INSTITUTIONAL_ACCESS_REGISTERED" ||
    value === "COVERAGE_VERIFICATION_REGISTERED"
  )
}

function isStoredTransaction(value: unknown): value is TransactionHistoryEntry {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    typeof record.actorId === "string" &&
    typeof record.actorName === "string" &&
    (record.actorRole === "ADMIN" ||
      record.actorRole === "PATIENT" ||
      record.actorRole === "DOCTOR" ||
      record.actorRole === "CLINIC" ||
      record.actorRole === "INSURANCE") &&
    isOperationType(record.operationType) &&
    typeof record.operationLabel === "string" &&
    (record.relatedDocumentId === undefined || typeof record.relatedDocumentId === "string") &&
    (record.relatedPermissionId === undefined || typeof record.relatedPermissionId === "string") &&
    typeof record.transactionHash === "string" &&
    typeof record.blockNumber === "number" &&
    typeof record.gasUsed === "string" &&
    (record.status === "CONFIRMED" || record.status === "REJECTED" || record.status === "FAILED") &&
    typeof record.occurredAt === "string" &&
    typeof record.simulated === "boolean"
  )
}

function readStoredTransactions(): TransactionHistoryEntry[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.sessionStorage.getItem(DEMO_TRANSACTIONS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isStoredTransaction).map((tx) => ({ ...tx }))
  } catch {
    return []
  }
}

function writeStoredTransactions(transactions: readonly TransactionHistoryEntry[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(DEMO_TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
}

export function DemoTransactionsProvider({ children }: { children: ReactNode }) {
  const [sessionTransactions, setSessionTransactions] = useState<TransactionHistoryEntry[]>(() =>
    readStoredTransactions(),
  )

  useEffect(() => {
    writeStoredTransactions(sessionTransactions)
  }, [sessionTransactions])

  const transactions = useMemo(() => {
    const mergedMap = new Map<string, TransactionHistoryEntry>()

    // Load static seeded ones
    initialTransactions.forEach((tx) => {
      mergedMap.set(tx.id, tx)
    })

    // Session ones override or add
    sessionTransactions.forEach((tx) => {
      mergedMap.set(tx.id, tx)
    })

    return Array.from(mergedMap.values())
  }, [sessionTransactions])

  const registerTransaction = useCallback(
    (input: Omit<TransactionHistoryEntry, "id" | "occurredAt" | "simulated">) => {
      const nextTx: TransactionHistoryEntry = {
        ...input,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        occurredAt: new Date().toISOString(),
        simulated: true,
      }

      setSessionTransactions((curr) => {
        // Prevent duplicate hash
        if (curr.some((tx) => tx.transactionHash === nextTx.transactionHash)) {
          return curr
        }
        const next = [...curr, nextTx]
        writeStoredTransactions(next)
        return next
      })

      return nextTx
    },
    [],
  )

  const findTransactionsByActorId = useCallback(
    (actorId: string) => transactions.filter((tx) => tx.actorId === actorId),
    [transactions],
  )

  const findTransactionsByDocumentId = useCallback(
    (documentId: string) => transactions.filter((tx) => tx.relatedDocumentId === documentId),
    [transactions],
  )

  const findTransactionsByPermissionId = useCallback(
    (permissionId: string) => transactions.filter((tx) => tx.relatedPermissionId === permissionId),
    [transactions],
  )

  const resetDemoTransactions = useCallback(() => {
    setSessionTransactions([])
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(DEMO_TRANSACTIONS_STORAGE_KEY)
    }
  }, [])

  const value = useMemo<DemoTransactionsContextValue>(
    () => ({
      transactions,
      registerTransaction,
      findTransactionsByActorId,
      findTransactionsByDocumentId,
      findTransactionsByPermissionId,
      resetDemoTransactions,
    }),
    [
      transactions,
      registerTransaction,
      findTransactionsByActorId,
      findTransactionsByDocumentId,
      findTransactionsByPermissionId,
      resetDemoTransactions,
    ],
  )

  return <DemoTransactionsContext.Provider value={value}>{children}</DemoTransactionsContext.Provider>
}

export { DemoTransactionsContext }

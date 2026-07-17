import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { demoAccessRecords } from "@/mocks/access-records"
import type { AccessRecord, AccessActionType, AccessResult } from "@/types/access-record"
import { generateMockTransactionHash, generateMockBlockNumber, generateMockGasUsed } from "@/utils/permissions"

const DEMO_ACCESS_RECORDS_STORAGE_KEY = "medirecord-demo-access-records"

interface DemoAccessRecordsContextValue {
  accessRecords: readonly AccessRecord[]
  registerAccess: (input: Omit<AccessRecord, "id" | "occurredAt" | "transactionHash" | "blockNumber" | "gasUsed"> & {
    transactionHash?: string
    blockNumber?: number
    gasUsed?: string
  }) => AccessRecord
  findRecordsByActorId: (actorId: string) => AccessRecord[]
  findRecordsByPatientId: (patientId: string) => AccessRecord[]
  findRecordsByDocumentId: (documentId: string) => AccessRecord[]
  findRecordsByPermissionId: (permissionId: string) => AccessRecord[]
}

const DemoAccessRecordsContext = createContext<DemoAccessRecordsContextValue | null>(null)

const initialAccessRecords = demoAccessRecords.map((rec) => ({ ...rec }))

function isAccessActionType(value: unknown): value is AccessActionType {
  return value === "MEDICAL_CONSULTATION" || value === "INSTITUTIONAL_ACCESS" || value === "COVERAGE_VERIFICATION"
}

function isAccessResult(value: unknown): value is AccessResult {
  return value === "GRANTED" || value === "DENIED"
}

function isStoredAccessRecord(value: unknown): value is AccessRecord {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    typeof record.permissionId === "string" &&
    typeof record.documentId === "string" &&
    typeof record.documentName === "string" &&
    typeof record.patientId === "string" &&
    typeof record.patientName === "string" &&
    typeof record.actorId === "string" &&
    typeof record.actorName === "string" &&
    typeof record.actorWallet === "string" &&
    (record.actorRole === "DOCTOR" || record.actorRole === "CLINIC" || record.actorRole === "INSURANCE") &&
    isAccessActionType(record.actionType) &&
    typeof record.occurredAt === "string" &&
    isAccessResult(record.result) &&
    typeof record.transactionHash === "string" &&
    typeof record.blockNumber === "number" &&
    typeof record.gasUsed === "string"
  )
}

function readStoredAccessRecords(): AccessRecord[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.sessionStorage.getItem(DEMO_ACCESS_RECORDS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isStoredAccessRecord).map((rec) => ({ ...rec }))
  } catch {
    return []
  }
}

function writeStoredAccessRecords(records: readonly AccessRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(DEMO_ACCESS_RECORDS_STORAGE_KEY, JSON.stringify(records))
}

function generateAccessRecordId(): string {
  const randomSegment = Math.random().toString(36).slice(2, 8)
  return `acc-${Date.now().toString(36)}-${randomSegment}`
}

export function DemoAccessRecordsProvider({ children }: { children: ReactNode }) {
  const [sessionRecords, setSessionRecords] = useState<AccessRecord[]>(() => readStoredAccessRecords())

  useEffect(() => {
    writeStoredAccessRecords(sessionRecords)
  }, [sessionRecords])

  const accessRecords = useMemo(() => {
    const mergedMap = new Map<string, AccessRecord>()

    initialAccessRecords.forEach((rec) => {
      mergedMap.set(rec.id, rec)
    })

    sessionRecords.forEach((rec) => {
      mergedMap.set(rec.id, rec)
    })

    return Array.from(mergedMap.values())
  }, [sessionRecords])

  const findRecordsByActorId = useCallback(
    (actorId: string) => accessRecords.filter((rec) => rec.actorId === actorId),
    [accessRecords],
  )

  const findRecordsByPatientId = useCallback(
    (patientId: string) => accessRecords.filter((rec) => rec.patientId === patientId),
    [accessRecords],
  )

  const findRecordsByDocumentId = useCallback(
    (documentId: string) => accessRecords.filter((rec) => rec.documentId === documentId),
    [accessRecords],
  )

  const findRecordsByPermissionId = useCallback(
    (permissionId: string) => accessRecords.filter((rec) => rec.permissionId === permissionId),
    [accessRecords],
  )

  const registerAccess = useCallback(
    (input: Omit<AccessRecord, "id" | "occurredAt" | "transactionHash" | "blockNumber" | "gasUsed"> & {
      transactionHash?: string
      blockNumber?: number
      gasUsed?: string
    }) => {
      const nextRecord: AccessRecord = {
        ...input,
        id: generateAccessRecordId(),
        occurredAt: new Date().toISOString(),
        transactionHash: input.transactionHash || generateMockTransactionHash(),
        blockNumber: input.blockNumber || generateMockBlockNumber(),
        gasUsed: input.gasUsed || generateMockGasUsed(),
      }

      setSessionRecords((curr) => {
        const next = [...curr, nextRecord]
        writeStoredAccessRecords(next)
        return next
      })

      return nextRecord
    },
    [],
  )

  const value = useMemo<DemoAccessRecordsContextValue>(
    () => ({
      accessRecords,
      registerAccess,
      findRecordsByActorId,
      findRecordsByPatientId,
      findRecordsByDocumentId,
      findRecordsByPermissionId,
    }),
    [
      accessRecords,
      registerAccess,
      findRecordsByActorId,
      findRecordsByPatientId,
      findRecordsByDocumentId,
      findRecordsByPermissionId,
    ],
  )

  return <DemoAccessRecordsContext.Provider value={value}>{children}</DemoAccessRecordsContext.Provider>
}

export { DemoAccessRecordsContext }

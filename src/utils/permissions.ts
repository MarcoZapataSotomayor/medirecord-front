import { ROLE_CAPABILITIES } from "@/config/role-capabilities"
import type { Permission, PermissionStatus } from "@/types/permission"
import type { UserRole } from "@/types/user"

export type RoleCapabilityKey = keyof typeof ROLE_CAPABILITIES.ADMIN

export function isPermissionExpired(
  permission: Pick<Permission, "expiresAt">,
  referenceDate: Date = new Date(),
): boolean {
  const expiresAt = new Date(permission.expiresAt)

  if (Number.isNaN(expiresAt.getTime())) {
    return false
  }

  return expiresAt.getTime() < referenceDate.getTime()
}

export function getEffectivePermissionStatus(
  permission: Pick<Permission, "status" | "expiresAt">,
  referenceDate: Date = new Date(),
): PermissionStatus {
  if (permission.status === "REVOKED") {
    return "REVOKED"
  }

  if (permission.status === "EXPIRED" || isPermissionExpired(permission, referenceDate)) {
    return "EXPIRED"
  }

  return "ACTIVE"
}

export function isRoleActionEnabled(
  role: UserRole,
  capability: RoleCapabilityKey,
): boolean {
  return ROLE_CAPABILITIES[role][capability]
}

// Las validaciones visuales en el frontend no sustituyen al contrato inteligente ni al backend.
// Los identificadores y hashes simulados no representan una operación real en blockchain.

import type { User } from "@/types/user"
import type { TransactionRecord, TransactionStatus } from "@/types/transaction"

export interface PermissionFilters {
  search: string
  role: string | "ALL"
  status: PermissionStatus | "ALL"
  sort: "ISSUED_DESC" | "ISSUED_ASC" | "EXPIRY_DESC" | "EXPIRY_ASC"
}

export function filterAndSortPermissions(
  permissions: readonly Permission[],
  filters: PermissionFilters,
): Permission[] {
  const searchTerm = filters.search.trim().toLowerCase()

  let result = permissions.filter((perm) => {
    const matchesSearch =
      searchTerm.length === 0 ||
      perm.documentName.toLowerCase().includes(searchTerm) ||
      perm.authorizedUserName.toLowerCase().includes(searchTerm) ||
      perm.authorizedWallet.toLowerCase().includes(searchTerm)

    const matchesRole = filters.role === "ALL" || perm.authorizedRole === filters.role
    
    const matchesStatus = filters.status === "ALL" || getEffectivePermissionStatus(perm) === filters.status

    return matchesSearch && matchesRole && matchesStatus
  })

  result.sort((a, b) => {
    if (filters.sort === "ISSUED_DESC") {
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    }
    if (filters.sort === "ISSUED_ASC") {
      return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime()
    }
    if (filters.sort === "EXPIRY_DESC") {
      return new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
    }
    if (filters.sort === "EXPIRY_ASC") {
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    }
    return 0
  })

  return result
}

export function hasActiveDuplicatePermission(
  documentId: string,
  authorizedWallet: string,
  permissions: readonly Permission[],
): boolean {
  const normalizedWallet = authorizedWallet.trim().toLowerCase()

  return permissions.some((perm) => {
    return (
      perm.documentId === documentId &&
      perm.authorizedWallet.trim().toLowerCase() === normalizedWallet &&
      getEffectivePermissionStatus(perm) === "ACTIVE"
    )
  })
}

export function getValidRecipients(participants: readonly User[], patientId: string): User[] {
  return participants.filter((p) => {
    const isRecipientRole = p.role === "DOCTOR" || p.role === "CLINIC" || p.role === "INSURANCE"
    const isActive = p.status === "ACTIVE"
    const isNotPatientSelf = p.id !== patientId
    return isRecipientRole && isActive && isNotPatientSelf
  })
}

export function generateMockTransactionHash(): string {
  const chars = "0123456789abcdef"
  let hash = "0x"
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    for (let i = 0; i < array.length; i++) {
      hash += chars[array[i] % 16]
    }
  } else {
    for (let i = 0; i < 32; i++) {
      hash += chars[Math.floor(Math.random() * 16)]
    }
  }
  return hash
}

export function generateMockBlockNumber(): number {
  return Math.floor(5400000 + Math.random() * 800000)
}

export function generateMockGasUsed(): string {
  const baseGas = Math.floor(82000 + Math.random() * 35000)
  return baseGas.toLocaleString("en-US")
}

export function createMockTransactionRecord(
  action: string,
  status: TransactionStatus,
  txHash: string | null = null,
): TransactionRecord {
  const now = new Date().toISOString()
  const block = status === "CONFIRMED" ? generateMockBlockNumber() : null
  const gas = status === "CONFIRMED" ? generateMockGasUsed() : null
  const hash = txHash || (status !== "IDLE" && status !== "AWAITING_SIGNATURE" && status !== "REJECTED" ? generateMockTransactionHash() : null)

  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    action,
    createdAt: now,
    updatedAt: status !== "IDLE" ? now : null,
    transactionHash: hash,
    blockNumber: block,
    gasUsed: gas,
    explorerUrl: null, // Ver en Etherscan deshabilitado
    errorMessage: status === "FAILED" ? "Firma de transacción rechazada o fallo en el nodo." : null,
  }
}
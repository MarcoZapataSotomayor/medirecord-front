import type { TransactionHistoryEntry, OperationType } from "@/types/transaction-history"
import type { UserRole } from "@/types/user"

// Estas utilidades de transacciones son para presentación técnica simulada en el frontend.
// No representan transacciones reales de Ethereum Sepolia.

export function filterAndSortTransactions(
  transactions: readonly TransactionHistoryEntry[],
  role: UserRole,
  currentUserId: string,
  filters: {
    search: string
    operationType: OperationType | "ALL"
    sortOrder: "DESC" | "ASC"
  },
): TransactionHistoryEntry[] {
  const q = filters.search.trim().toLowerCase()

  let filtered = transactions.filter((tx) => {
    // 1. Role scope filter
    let isRelevant = false
    if (role === "ADMIN") {
      isRelevant = true
    } else if (role === "PATIENT") {
      isRelevant = tx.actorId === currentUserId
    } else {
      isRelevant = tx.actorId === currentUserId
    }

    if (!isRelevant) return false

    // 2. Type filter
    if (filters.operationType !== "ALL" && tx.operationType !== filters.operationType) {
      return false
    }

    // 3. Search query filter
    const matchesSearch =
      q.length === 0 ||
      tx.transactionHash.toLowerCase().includes(q) ||
      tx.operationLabel.toLowerCase().includes(q) ||
      (tx.relatedDocumentId && tx.relatedDocumentId.toLowerCase().includes(q)) ||
      (tx.relatedPermissionId && tx.relatedPermissionId.toLowerCase().includes(q))

    return matchesSearch
  })

  // Sort
  filtered.sort((a, b) => {
    const timeA = new Date(a.occurredAt).getTime()
    const timeB = new Date(b.occurredAt).getTime()
    return filters.sortOrder === "DESC" ? timeB - timeA : timeA - timeB
  })

  return filtered
}

import type { Activity } from "@/types/activity"
import type { UserRole } from "@/types/user"

// Estas funciones y filtros de historial son para presentación en modo demostración.
// No representan logs reales del Registry en blockchain Sepolia ni auditorías del backend.

export function abbreviateHash(hash: string): string {
  if (!hash || hash.length <= 12) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

export function filterActivityByRoleAndRange(
  activities: readonly Activity[],
  role: UserRole,
  currentUserId: string,
  timeRange: "ALL" | "7_DAYS" | "30_DAYS",
  searchText: string = "",
): Activity[] {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  const q = searchText.trim().toLowerCase()

  let filtered = activities.filter((act) => {
    // 1. Role scope filter
    let isRelevant = false
    if (role === "ADMIN") {
      isRelevant = true
    } else if (role === "PATIENT") {
      isRelevant = act.actorId === currentUserId || act.relatedUserId === currentUserId
    } else {
      // DOCTOR, CLINIC, INSURANCE
      isRelevant = act.actorId === currentUserId
    }

    if (!isRelevant) return false

    // 2. Date range filter
    const actTime = new Date(act.occurredAt).getTime()
    if (timeRange === "7_DAYS" && actTime < sevenDaysAgo) return false
    if (timeRange === "30_DAYS" && actTime < thirtyDaysAgo) return false

    // 3. Search query filter
    const matchesSearch =
      q.length === 0 ||
      act.title.toLowerCase().includes(q) ||
      act.description.toLowerCase().includes(q) ||
      (act.documentId && act.documentId.toLowerCase().includes(q)) ||
      (act.permissionId && act.permissionId.toLowerCase().includes(q))

    return matchesSearch
  })

  // Sort descending (newest first)
  return [...filtered].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
}

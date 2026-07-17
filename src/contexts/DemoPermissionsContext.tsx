import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { demoPermissions } from "@/mocks/permissions"
import type { Permission, PermissionStatus } from "@/types/permission"

const DEMO_PERMISSIONS_STORAGE_KEY = "medirecord-demo-permissions"

interface DemoPermissionsContextValue {
  permissions: readonly Permission[]
  registerPermission: (permission: Omit<Permission, "id" | "tokenId" | "issuedAt" | "status" | "transactionHash">) => Permission
  revokePermission: (permissionId: string, transactionHash: string) => void
  findPermissionById: (permissionId: string) => Permission | undefined
  findPermissionsByPatientId: (patientId: string) => Permission[]
  findPermissionsByAuthorizedUserId: (authorizedUserId: string) => Permission[]
}

const DemoPermissionsContext = createContext<DemoPermissionsContextValue | null>(null)

const initialPermissions = demoPermissions.map((perm) => ({ ...perm }))

function isPermissionStatus(value: unknown): value is PermissionStatus {
  return value === "ACTIVE" || value === "EXPIRED" || value === "REVOKED"
}

function isStoredPermissionRecord(value: unknown): value is Permission {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    typeof record.tokenId === "string" &&
    typeof record.documentId === "string" &&
    typeof record.documentName === "string" &&
    typeof record.patientId === "string" &&
    typeof record.patientName === "string" &&
    typeof record.authorizedUserId === "string" &&
    typeof record.authorizedUserName === "string" &&
    typeof record.authorizedWallet === "string" &&
    (record.authorizedRole === "DOCTOR" || record.authorizedRole === "CLINIC" || record.authorizedRole === "INSURANCE") &&
    (record.accessType === "READ" || record.accessType === "WRITE") &&
    typeof record.issuedAt === "string" &&
    typeof record.expiresAt === "string" &&
    isPermissionStatus(record.status) &&
    typeof record.transactionHash === "string"
  )
}

function readStoredPermissions(): Permission[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.sessionStorage.getItem(DEMO_PERMISSIONS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isStoredPermissionRecord).map((perm) => ({ ...perm }))
  } catch {
    return []
  }
}

function writeStoredPermissions(permissions: readonly Permission[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(DEMO_PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions))
}

function generateDemoPermissionId(): string {
  const randomSegment = Math.random().toString(36).slice(2, 8)
  return `perm-${Date.now().toString(36)}-${randomSegment}`
}

function generateDemoTokenId(existingPermissions: readonly Permission[]): string {
  let maxTokenId = 7000
  existingPermissions.forEach((p) => {
    const numeric = parseInt(p.tokenId, 10)
    if (!isNaN(numeric) && numeric > maxTokenId) {
      maxTokenId = numeric
    }
  })
  return String(maxTokenId + 1)
}

export function DemoPermissionsProvider({ children }: { children: ReactNode }) {
  // We will persist the custom/modified permissions to session storage.
  const [sessionPermissions, setSessionPermissions] = useState<Permission[]>(() => readStoredPermissions())

  useEffect(() => {
    writeStoredPermissions(sessionPermissions)
  }, [sessionPermissions])

  // Merge initialPermissions and sessionPermissions, resolving session overrides (like revocations)
  const permissions = useMemo(() => {
    const mergedMap = new Map<string, Permission>()

    // Load initial ones
    initialPermissions.forEach((perm) => {
      mergedMap.set(perm.id, perm)
    })

    // Session ones override initial or add new ones
    sessionPermissions.forEach((perm) => {
      mergedMap.set(perm.id, perm)
    })

    return Array.from(mergedMap.values())
  }, [sessionPermissions])

  const findPermissionById = useCallback(
    (permissionId: string) => permissions.find((perm) => perm.id === permissionId),
    [permissions],
  )

  const findPermissionsByPatientId = useCallback(
    (patientId: string) => permissions.filter((perm) => perm.patientId === patientId),
    [permissions],
  )

  const findPermissionsByAuthorizedUserId = useCallback(
    (authorizedUserId: string) => permissions.filter((perm) => perm.authorizedUserId === authorizedUserId),
    [permissions],
  )

  const registerPermission = useCallback(
    (input: Omit<Permission, "id" | "tokenId" | "issuedAt" | "status" | "transactionHash">) => {
      // Calculate token ID safely
      const nextTokenId = generateDemoTokenId(permissions)
      const nextTransactionHash = `0xpermhash${nextTokenId}`

      const nextPermission: Permission = {
        ...input,
        id: generateDemoPermissionId(),
        tokenId: nextTokenId,
        issuedAt: new Date().toISOString(),
        status: "ACTIVE",
        transactionHash: nextTransactionHash,
      }

      setSessionPermissions((curr) => {
        const next = [...curr, nextPermission]
        writeStoredPermissions(next)
        return next
      })

      return nextPermission
    },
    [permissions],
  )

  const revokePermission = useCallback(
    (permissionId: string, transactionHash: string) => {
      setSessionPermissions((curr) => {
        const existingIndex = curr.findIndex((p) => p.id === permissionId)
        
        let next: Permission[]
        if (existingIndex >= 0) {
          next = curr.map((p, idx) => {
            if (idx === existingIndex) {
              return { ...p, status: "REVOKED", transactionHash }
            }
            return p
          })
        } else {
          // If the permission is in the initial mocks list, we copy it over to session with REVOKED status
          const original = initialPermissions.find((p) => p.id === permissionId)
          if (original) {
            next = [...curr, { ...original, status: "REVOKED", transactionHash }]
          } else {
            return curr
          }
        }

        writeStoredPermissions(next)
        return next
      })
    },
    [],
  )

  const value = useMemo<DemoPermissionsContextValue>(
    () => ({
      permissions,
      registerPermission,
      revokePermission,
      findPermissionById,
      findPermissionsByPatientId,
      findPermissionsByAuthorizedUserId,
    }),
    [
      permissions,
      registerPermission,
      revokePermission,
      findPermissionById,
      findPermissionsByPatientId,
      findPermissionsByAuthorizedUserId,
    ],
  )

  return <DemoPermissionsContext.Provider value={value}>{children}</DemoPermissionsContext.Provider>
}

export { DemoPermissionsContext }

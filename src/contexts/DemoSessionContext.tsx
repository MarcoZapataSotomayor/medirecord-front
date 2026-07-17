import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { carlosMendoza, demoUsers } from "@/mocks/users"
import { connectedWalletState, disconnectedWalletState } from "@/mocks/wallet-state"
import type { User, UserRole } from "@/types/user"
import type { WalletState } from "@/types/wallet"

const DEMO_SESSION_STORAGE_KEY = "medirecord-demo-session"
const DEFAULT_USER_ID = carlosMendoza.id

interface StoredDemoSession {
  selectedUserId: string
  isConnected: boolean
}

interface DemoSessionContextValue {
  currentUser: User
  currentRole: UserRole
  walletState: WalletState
  isConnected: boolean
  availableUsers: readonly User[]
  connectDemoUser: (userId?: string) => void
  disconnectDemoSession: () => void
  switchDemoUser: (userId: string) => void
}

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null)

function findUserById(userId: string | null | undefined): User {
  return demoUsers.find((user) => user.id === userId) ?? carlosMendoza
}

function readStoredSession(): StoredDemoSession | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (
      typeof parsedValue === "object" &&
      parsedValue !== null &&
      "selectedUserId" in parsedValue &&
      typeof (parsedValue as StoredDemoSession).selectedUserId === "string" &&
      "isConnected" in parsedValue &&
      typeof (parsedValue as StoredDemoSession).isConnected === "boolean"
    ) {
      return parsedValue as StoredDemoSession
    }
  } catch {
    return null
  }

  return null
}

function writeStoredSession(session: StoredDemoSession) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session))
}

function clearStoredSession() {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY)
}

function createConnectedWalletState(user: User): WalletState {
  if (user.id === carlosMendoza.id) {
    return connectedWalletState
  }

  return {
    connectionStatus: "CONNECTED",
    networkStatus: "SEPOLIA",
    registrationStatus: "REGISTERED",
    address: user.walletAddress,
    chainId: "0xaa36a7",
    errorMessage: null,
  }
}

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const storedSession = readStoredSession()
  const [selectedUserId, setSelectedUserId] = useState<string>(
    storedSession?.selectedUserId ?? DEFAULT_USER_ID,
  )
  const [isConnected, setIsConnected] = useState<boolean>(
    storedSession?.isConnected ?? false,
  )

  const currentUser = useMemo(() => findUserById(selectedUserId), [selectedUserId])

  useEffect(() => {
    if (!isConnected) {
      return
    }

    writeStoredSession({ selectedUserId, isConnected })
  }, [selectedUserId, isConnected])

  const connectDemoUser = useCallback((userId?: string) => {
    const nextUser = findUserById(userId ?? selectedUserId)
    setSelectedUserId(nextUser.id)
    setIsConnected(true)
    writeStoredSession({ selectedUserId: nextUser.id, isConnected: true })
  }, [selectedUserId])

  const disconnectDemoSession = useCallback(() => {
    clearStoredSession()
    setSelectedUserId(DEFAULT_USER_ID)
    setIsConnected(false)
  }, [])

  const switchDemoUser = useCallback((userId: string) => {
    const nextUser = findUserById(userId)
    setSelectedUserId(nextUser.id)

    if (isConnected) {
      writeStoredSession({ selectedUserId: nextUser.id, isConnected: true })
    }
  }, [isConnected])

  const value = useMemo<DemoSessionContextValue>(
    () => ({
      currentUser,
      currentRole: currentUser.role,
      walletState: isConnected
        ? createConnectedWalletState(currentUser)
        : disconnectedWalletState,
      isConnected,
      availableUsers: demoUsers,
      connectDemoUser,
      disconnectDemoSession,
      switchDemoUser,
    }),
    [currentUser, isConnected, connectDemoUser, disconnectDemoSession, switchDemoUser],
  )

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>
}

export { DemoSessionContext }
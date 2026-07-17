import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { demoUsers } from "@/mocks/users"
import type { User, UserRole, UserStatus } from "@/types/user"
import {
  isValidEthereumWallet,
  type ParticipantRegistrationInput,
} from "@/utils/participants"

const DEMO_PARTICIPANTS_STORAGE_KEY = "medirecord-demo-participants"

interface DemoParticipantsContextValue {
  participants: readonly User[]
  registerParticipant: (input: ParticipantRegistrationInput) => User
  findParticipantById: (participantId: string) => User | undefined
  findParticipantByWallet: (walletAddress: string) => User | undefined
}

interface StoredParticipantRecord {
  id: string
  fullName: string
  role: UserRole
  walletAddress: string
  status: UserStatus
}

const DemoParticipantsContext = createContext<DemoParticipantsContextValue | null>(null)

const initialParticipants = demoUsers.map((participant) => ({ ...participant }))

function isUserRole(value: unknown): value is UserRole {
  return value === "ADMIN" || value === "PATIENT" || value === "DOCTOR" || value === "CLINIC" || value === "INSURANCE"
}

function isUserStatus(value: unknown): value is UserStatus {
  return value === "ACTIVE" || value === "INACTIVE" || value === "SUSPENDED"
}

function isStoredParticipantRecord(value: unknown): value is StoredParticipantRecord {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    typeof record.fullName === "string" &&
    isUserRole(record.role) &&
    typeof record.walletAddress === "string" &&
    isValidEthereumWallet(record.walletAddress) &&
    isUserStatus(record.status)
  )
}

function readStoredParticipants(): User[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const rawValue = window.sessionStorage.getItem(DEMO_PARTICIPANTS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isStoredParticipantRecord).map((participant) => ({ ...participant }))
  } catch {
    return []
  }
}

function writeStoredParticipants(participants: readonly User[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(DEMO_PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants))
}

function createParticipantId() {
  const randomSegment = Math.random().toString(36).slice(2, 8)
  return `participant-${Date.now().toString(36)}-${randomSegment}`
}

export function DemoParticipantsProvider({ children }: { children: ReactNode }) {
  const [sessionParticipants, setSessionParticipants] = useState<User[]>(() => readStoredParticipants())

  useEffect(() => {
    writeStoredParticipants(sessionParticipants)
  }, [sessionParticipants])

  const participants = useMemo(
    () => [...initialParticipants, ...sessionParticipants],
    [sessionParticipants],
  )

  const findParticipantById = useCallback(
    (participantId: string) => participants.find((participant) => participant.id === participantId),
    [participants],
  )

  const findParticipantByWallet = useCallback(
    (walletAddress: string) => {
      const normalizedWallet = walletAddress.trim().toLowerCase()

      return participants.find(
        (participant) => participant.walletAddress.trim().toLowerCase() === normalizedWallet,
      )
    },
    [participants],
  )

  const registerParticipant = useCallback(
    (input: ParticipantRegistrationInput) => {
      const nextParticipant: User = {
        id: createParticipantId(),
        fullName: input.fullName.trim(),
        role: input.role,
        walletAddress: input.walletAddress.trim(),
        status: "ACTIVE",
      }

      setSessionParticipants((currentParticipants) => {
        const nextParticipants = [...currentParticipants, nextParticipant]
        writeStoredParticipants(nextParticipants)
        return nextParticipants
      })

      return nextParticipant
    },
    [],
  )

  const value = useMemo<DemoParticipantsContextValue>(
    () => ({
      participants,
      registerParticipant,
      findParticipantById,
      findParticipantByWallet,
    }),
    [findParticipantById, findParticipantByWallet, participants, registerParticipant],
  )

  return <DemoParticipantsContext.Provider value={value}>{children}</DemoParticipantsContext.Provider>
}

export { DemoParticipantsContext }

export type TransactionStatus =
  | "IDLE"
  | "AWAITING_SIGNATURE"
  | "SUBMITTED"
  | "CONFIRMING"
  | "CONFIRMED"
  | "REJECTED"
  | "FAILED"

export interface TransactionRecord {
  id: string
  status: TransactionStatus
  action: string
  createdAt: string
  updatedAt: string | null
  transactionHash: string | null
  blockNumber: number | null
  gasUsed: string | null
  explorerUrl: string | null
  errorMessage: string | null
}
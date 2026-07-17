export type WalletConnectionStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR"

export type NetworkStatus =
  | "UNKNOWN"
  | "METAMASK_NOT_INSTALLED"
  | "WRONG_NETWORK"
  | "SEPOLIA"

export type WalletRegistrationStatus = "REGISTERED" | "UNREGISTERED"

export interface WalletState {
  connectionStatus: WalletConnectionStatus
  networkStatus: NetworkStatus
  registrationStatus: WalletRegistrationStatus
  address: string | null
  chainId: string | null
  errorMessage: string | null
}
import type { WalletState } from "@/types/wallet"

import { carlosMendoza } from "./users"

export const disconnectedWalletState = {
  connectionStatus: "DISCONNECTED",
  networkStatus: "UNKNOWN",
  registrationStatus: "UNREGISTERED",
  address: null,
  chainId: null,
  errorMessage: null,
} satisfies WalletState

export const connectingWalletState = {
  connectionStatus: "CONNECTING",
  networkStatus: "UNKNOWN",
  registrationStatus: "UNREGISTERED",
  address: null,
  chainId: null,
  errorMessage: null,
} satisfies WalletState

export const connectedWalletState = {
  connectionStatus: "CONNECTED",
  networkStatus: "SEPOLIA",
  registrationStatus: "REGISTERED",
  address: carlosMendoza.walletAddress,
  chainId: "0xaa36a7",
  errorMessage: null,
} satisfies WalletState

export const metamaskNotInstalledWalletState = {
  connectionStatus: "ERROR",
  networkStatus: "METAMASK_NOT_INSTALLED",
  registrationStatus: "UNREGISTERED",
  address: null,
  chainId: null,
  errorMessage: "MetaMask no está instalada en el navegador.",
} satisfies WalletState

export const wrongNetworkWalletState = {
  connectionStatus: "CONNECTED",
  networkStatus: "WRONG_NETWORK",
  registrationStatus: "REGISTERED",
  address: carlosMendoza.walletAddress,
  chainId: "0x1",
  errorMessage: "La red activa no corresponde a Ethereum Sepolia.",
} satisfies WalletState

export const unregisteredUserWalletState = {
  connectionStatus: "CONNECTED",
  networkStatus: "SEPOLIA",
  registrationStatus: "UNREGISTERED",
  address: "0x10aB2C3d4E5f60718293A4b5C6d7E8f901234567",
  chainId: "0xaa36a7",
  errorMessage: "La cuenta conectada aún no tiene registro en la demo.",
} satisfies WalletState

export const rejectedConnectionWalletState = {
  connectionStatus: "ERROR",
  networkStatus: "UNKNOWN",
  registrationStatus: "UNREGISTERED",
  address: null,
  chainId: null,
  errorMessage: "La conexión fue rechazada por el usuario.",
} satisfies WalletState

export const unknownWalletErrorState = {
  connectionStatus: "ERROR",
  networkStatus: "UNKNOWN",
  registrationStatus: "UNREGISTERED",
  address: null,
  chainId: null,
  errorMessage: "No fue posible completar la validación de la cuenta.",
} satisfies WalletState

export const demoWalletStates = {
  disconnected: disconnectedWalletState,
  connecting: connectingWalletState,
  connected: connectedWalletState,
  metamaskNotInstalled: metamaskNotInstalledWalletState,
  wrongNetwork: wrongNetworkWalletState,
  unregisteredUser: unregisteredUserWalletState,
  rejectedConnection: rejectedConnectionWalletState,
  unknownError: unknownWalletErrorState,
} as const
export function abbreviateWalletAddress(
  walletAddress: string | null | undefined,
): string {
  if (typeof walletAddress !== "string") {
    return ""
  }

  const normalizedAddress = walletAddress.trim()

  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    return ""
  }

  return `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`
}
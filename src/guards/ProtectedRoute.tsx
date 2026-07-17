import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useDemoSession } from "@/hooks/use-demo-session"

export function ProtectedRoute() {
  const { isConnected } = useDemoSession()
  const location = useLocation()

  // La validación real del futuro confirmará wallet, red y rol contra MetaMask y Registry.
  if (!isConnected) {
    return <Navigate to="/connect" replace state={{ from: location }} />
  }

  return <Outlet />
}
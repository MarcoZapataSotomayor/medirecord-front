import { Outlet } from "react-router-dom"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/navigation/AppSidebar"
import { AppHeader } from "@/components/navigation/AppHeader"

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-background text-foreground">
        <div className="flex min-h-svh flex-1 flex-col bg-background text-foreground">
          <AppHeader />
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
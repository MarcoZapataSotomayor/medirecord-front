import { Link, useLocation } from "react-router-dom"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { MediRecordLogo } from "@/components/branding/MediRecordLogo"
import { RoleBadge } from "@/components/common/RoleBadge"
import { DemoUserSwitcher } from "@/components/navigation/DemoUserSwitcher"
import { useDemoSession } from "@/hooks/use-demo-session"
import { getNavigationItemsForRole } from "@/config/navigation"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const location = useLocation()
  const { currentUser } = useDemoSession()
  const { theme } = useTheme()
  const { isMobile, setOpenMobile } = useSidebar()
  const navigationItems = getNavigationItemsForRole(currentUser.role)

  const isDark = theme === "dark"

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-slate-200 dark:border-slate-800 bg-sidebar text-slate-900 dark:text-slate-100">
      <SidebarHeader className="gap-3 p-4">
        <MediRecordLogo compact tone={isDark ? "light" : "dark"} />
        <div className="flex items-center gap-2">
          <RoleBadge role={currentUser.role} />
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">
            Proyecto universitario
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-bold uppercase tracking-wider dark:text-slate-400">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = Boolean(
                  item.path &&
                    (location.pathname === item.path ||
                      (item.path !== "/app/dashboard" &&
                        item.path !== "/app" &&
                        location.pathname.startsWith(item.path + "/")))
                )
                const icon = <item.icon aria-hidden="true" />

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.enabled && item.path ? (
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link to={item.path} onClick={handleNavClick} />}
                        className="text-slate-700 hover:bg-slate-100 hover:text-slate-950 data-active:bg-slate-950 data-active:text-white dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:data-active:bg-slate-800 dark:data-active:text-white transition-colors"
                      >
                        {icon}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        disabled
                        className={cn(
                          "cursor-not-allowed text-slate-500 hover:bg-transparent hover:text-slate-500 dark:text-slate-500 dark:hover:text-transparent dark:hover:text-slate-500",
                          "data-disabled:opacity-85"
                        )}
                      >
                        {icon}
                        <span>{item.title}</span>
                        <SidebarMenuBadge>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                            {item.futureLabel ?? "Próximamente"}
                          </span>
                        </SidebarMenuBadge>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="bg-slate-200 dark:bg-slate-800" />

      <SidebarFooter className="gap-3 p-4">
        <DemoUserSwitcher />
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/80 p-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Ayuda rápida</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">La navegación privada se completará en los siguientes bloques.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
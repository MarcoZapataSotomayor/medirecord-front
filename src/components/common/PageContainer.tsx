import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

interface PageContainerProps extends PropsWithChildren {
  className?: string
}

export function PageContainer({ className, children }: PageContainerProps) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8", className)}>{children}</div>
}
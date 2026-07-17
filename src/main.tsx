import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "next-themes"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DemoParticipantsProvider } from "@/contexts/DemoParticipantsContext"
import { DemoSessionProvider } from "@/contexts/DemoSessionContext"
import { DemoDocumentsProvider } from "@/contexts/DemoDocumentsContext"
import { DemoPermissionsProvider } from "@/contexts/DemoPermissionsContext"
import { DemoAccessRecordsProvider } from "@/contexts/DemoAccessRecordsContext"
import { DemoTransactionsProvider } from "@/contexts/DemoTransactionsContext"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <TooltipProvider>
        <DemoParticipantsProvider>
          <DemoDocumentsProvider>
            <DemoPermissionsProvider>
              <DemoAccessRecordsProvider>
                <DemoTransactionsProvider>
                  <DemoSessionProvider>
                    <App />
                  </DemoSessionProvider>
                </DemoTransactionsProvider>
              </DemoAccessRecordsProvider>
            </DemoPermissionsProvider>
          </DemoDocumentsProvider>
        </DemoParticipantsProvider>
        <Toaster richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)

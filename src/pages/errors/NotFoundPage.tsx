import { Link } from "react-router-dom"
import { Home } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from "@/components/common/PageContainer"

export function NotFoundPage() {
  return (
    <PageContainer className="flex min-h-[calc(100vh-9rem)] items-center justify-center py-16">
      <Card className="w-full max-w-2xl border-slate-200/80 bg-white/95 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl text-slate-950">Página no encontrada</CardTitle>
          <CardDescription className="text-base text-slate-600">
            La ruta solicitada no existe dentro de la demostración pública de MediRecord.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-6">
          <Link to="/" className={buttonVariants({ size: "lg" })}>
            <Home className="size-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
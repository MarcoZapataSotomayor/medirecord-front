import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Files, Search, Eye } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDemoSession } from "@/hooks/use-demo-session"
import { useDemoPermissions } from "@/hooks/use-demo-permissions"
import { useDemoDocuments } from "@/hooks/use-demo-documents"
import { useDemoAccessRecords } from "@/hooks/use-demo-access-records"
import { getEffectivePermissionStatus } from "@/utils/permissions"
import { formatLongDate } from "@/utils/dashboard"
import type { Permission } from "@/types/permission"
import type { MedicalDocument } from "@/types/document"

interface FilterStates {
  search: string
  patient: string
  category: string | "ALL"
  sort: "EXPIRY_ASC" | "EXPIRY_DESC" | "NAME_ASC" | "NAME_DESC"
}

const initialFilters: FilterStates = {
  search: "",
  patient: "",
  category: "ALL",
  sort: "EXPIRY_ASC",
}

export function AuthorizedDocumentsPage() {
  const { currentUser } = useDemoSession()
  const { permissions } = useDemoPermissions()
  const { documents } = useDemoDocuments()
  const { accessRecords } = useDemoAccessRecords()

  const [filters, setFilters] = useState<FilterStates>(initialFilters)

  // Active permissions received by this user
  const activePermissions = useMemo(() => {
    return permissions.filter(
      (p) => p.authorizedUserId === currentUser.id && getEffectivePermissionStatus(p) === "ACTIVE",
    )
  }, [permissions, currentUser.id])

  // Map permissions to documents
  const authorizedDocsList = useMemo(() => {
    const list: Array<{ permission: Permission; document: MedicalDocument }> = []

    activePermissions.forEach((p) => {
      const doc = documents.find((d) => d.id === p.documentId)
      if (doc) {
        list.push({ permission: p, document: doc })
      }
    })

    return list
  }, [activePermissions, documents])

  // Filtered documents
  const filteredList = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const pQ = filters.patient.trim().toLowerCase()

    let result = authorizedDocsList.filter(({ permission, document }) => {
      const matchesSearch =
        q.length === 0 ||
        document.name.toLowerCase().includes(q) ||
        document.id.toLowerCase().includes(q)

      const matchesPatient =
        pQ.length === 0 || permission.patientName.toLowerCase().includes(pQ)

      const matchesCategory =
        filters.category === "ALL" || document.category === filters.category

      return matchesSearch && matchesPatient && matchesCategory
    })

    result.sort((a, b) => {
      if (filters.sort === "EXPIRY_ASC") {
        return new Date(a.permission.expiresAt).getTime() - new Date(b.permission.expiresAt).getTime()
      }
      if (filters.sort === "EXPIRY_DESC") {
        return new Date(b.permission.expiresAt).getTime() - new Date(a.permission.expiresAt).getTime()
      }
      if (filters.sort === "NAME_ASC") {
        return a.document.name.localeCompare(b.document.name)
      }
      if (filters.sort === "NAME_DESC") {
        return b.document.name.localeCompare(a.document.name)
      }
      return 0
    })

    return result
  }, [authorizedDocsList, filters])

  // Stats calculation
  const stats = useMemo(() => {
    const uniqueDocIds = new Set(activePermissions.map((p) => p.documentId))
    const totalDocs = uniqueDocIds.size
    const activePermsCount = activePermissions.length

    // Expiring soon: active permission expiring in less than 30 days
    const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000
    const expiringSoon = activePermissions.filter(
      (p) => new Date(p.expiresAt).getTime() <= thirtyDaysFromNow,
    ).length

    // Total access records registered by this actor
    const actorAccesses = accessRecords.filter((rec) => rec.actorId === currentUser.id).length

    return {
      totalDocs,
      activePermsCount,
      expiringSoon,
      actorAccesses,
    }
  }, [activePermissions, accessRecords, currentUser.id])

  const handleClearFilters = () => setFilters(initialFilters)

  // Document categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>()
    authorizedDocsList.forEach(({ document }) => set.add(document.category))
    return Array.from(set)
  }, [authorizedDocsList])

  // Title and desc by role
  const pageHeadings = useMemo(() => {
    if (currentUser.role === "DOCTOR") {
      return {
        title: "Documentos compartidos conmigo",
        desc: "Consulta documentos asociados a autorizaciones vigentes otorgadas por los pacientes.",
      }
    }
    if (currentUser.role === "CLINIC") {
      return {
        title: "Documentos autorizados",
        desc: "Consulta documentos habilitados para tu cuenta institucional.",
      }
    }
    return {
      title: "Documentos para verificación",
      desc: "Consulta documentos autorizados para procesos de cobertura y auditoría.",
    }
  }, [currentUser.role])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{pageHeadings.title}</h1>
            <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-800">
              Modo demostración
            </Badge>
          </div>
          <p className="text-sm text-slate-500">{pageHeadings.desc}</p>
        </div>
      </div>

      {/* Stats section */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Documentos disponibles</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDocs}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Permisos activos</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.activePermsCount}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Vencimiento cercano</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.expiringSoon}</p>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Accesos registrados</p>
          <p className="text-2xl font-bold text-sky-700 mt-1">{stats.actorAccesses}</p>
        </Card>
      </section>

      {/* Filters */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_repeat(2,minmax(0,0.65fr))_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="doc-search" className="text-sm font-medium text-slate-700">
              Buscar documento
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="doc-search"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Nombre o ID de documento..."
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="patient-search" className="text-sm font-medium text-slate-700">
              Buscar paciente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="patient-search"
                value={filters.patient}
                onChange={(e) => setFilters((prev) => ({ ...prev, patient: e.target.value }))}
                placeholder="Nombre del paciente..."
                className="pl-9 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="doc-cat" className="text-sm font-medium text-slate-700">
              Categoría
            </label>
            <Select value={filters.category} onValueChange={(val) => { if (val) setFilters((prev) => ({ ...prev, category: val })) }}>
              <SelectTrigger id="doc-cat" className="bg-white">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="doc-sort" className="text-sm font-medium text-slate-700">
              Orden
            </label>
            <Select value={filters.sort} onValueChange={(val) => { if (val) setFilters((prev) => ({ ...prev, sort: val as any })) }}>
              <SelectTrigger id="doc-sort" className="bg-white">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPIRY_ASC">Vencimiento (Más cercano)</SelectItem>
                <SelectItem value="EXPIRY_DESC">Vencimiento (Más lejano)</SelectItem>
                <SelectItem value="NAME_ASC">Nombre (A-Z)</SelectItem>
                <SelectItem value="NAME_DESC">Nombre (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button type="button" variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List content */}
      {authorizedDocsList.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white shadow-sm p-12 text-center flex flex-col items-center gap-4">
          <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500">
            <Files className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">No tienes documentos autorizados disponibles</h2>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed mx-auto">
              Aparecerán aquí cuando un paciente te comparta un documento médico y el permiso se encuentre activo.
            </p>
          </div>
        </Card>
      ) : filteredList.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white shadow-sm p-12 text-center flex flex-col items-center gap-4">
          <div className="rounded-full border border-slate-200 bg-slate-50 p-4 text-slate-500">
            <Search className="size-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">No se encontraron documentos</h2>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed mx-auto">
              Ninguno de tus documentos autorizados coincide con los filtros establecidos.
            </p>
          </div>
          <Button onClick={handleClearFilters}>Limpiar filtros</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                <TableHead className="font-semibold text-slate-700">Documento</TableHead>
                <TableHead className="font-semibold text-slate-700">Paciente</TableHead>
                <TableHead className="font-semibold text-slate-700">Categoría</TableHead>
                <TableHead className="font-semibold text-slate-700">ID Técnico</TableHead>
                <TableHead className="font-semibold text-slate-700">Expiración</TableHead>
                <TableHead className="font-semibold text-slate-700">Credencial</TableHead>
                <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map(({ permission, document }) => {
                return (
                  <TableRow key={permission.id} className="hover:bg-slate-50/30">
                    <TableCell className="font-medium text-slate-900 truncate max-w-[180px]">
                      {document.name}
                    </TableCell>
                    <TableCell className="text-slate-800">{permission.patientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">
                        {document.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {document.id}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {formatLongDate(permission.expiresAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-500">
                      #{permission.tokenId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/app/authorized-documents/${document.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" }) + " h-8 gap-1 text-xs inline-flex items-center border-sky-200 text-sky-700 hover:bg-sky-50/50"}
                      >
                        <Eye className="size-3.5" />
                        <span>Ver documento</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

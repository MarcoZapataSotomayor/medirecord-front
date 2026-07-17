import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  DocumentCategoryFilter,
  DocumentStatusFilter,
  DocumentSortOrder,
} from "@/utils/documents"

interface DocumentsFiltersProps {
  search: string
  category: DocumentCategoryFilter
  status: DocumentStatusFilter
  sort: DocumentSortOrder
  onSearchChange: (value: string) => void
  onCategoryChange: (value: DocumentCategoryFilter) => void
  onStatusChange: (value: DocumentStatusFilter) => void
  onSortChange: (value: DocumentSortOrder) => void
  onClearFilters: () => void
}

const categoryOptions: Array<{ value: DocumentCategoryFilter; label: string }> = [
  { value: "ALL", label: "Todas las categorías" },
  { value: "Consulta", label: "Consulta" },
  { value: "Constancia", label: "Constancia" },
  { value: "Informe", label: "Informe" },
  { value: "Seguimiento", label: "Seguimiento" },
  { value: "Verificación", label: "Verificación" },
  { value: "Receta", label: "Receta" },
  { value: "Resultado de examen", label: "Resultado de examen" },
  { value: "Informe médico", label: "Informe médico" },
  { value: "Otro", label: "Otro" },
]

const statusOptions: Array<{ value: DocumentStatusFilter; label: string }> = [
  { value: "ALL", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activo" },
  { value: "ARCHIVED", label: "Archivado" },
  { value: "RESTRICTED", label: "Restringido" },
]

const sortOptions: Array<{ value: DocumentSortOrder; label: string }> = [
  { value: "NEWEST", label: "Más reciente" },
  { value: "OLDEST", label: "Más antiguo" },
]

export function DocumentsFilters({
  search,
  category,
  status,
  sort,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
}: DocumentsFiltersProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.65fr))_auto] lg:items-end">
        <div className="space-y-2">
          <label htmlFor="documents-search" className="text-sm font-medium text-slate-700">
            Buscar por nombre o ID
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="documents-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ej. Resumen de atención..."
              className="pl-9 bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="documents-category" className="text-sm font-medium text-slate-700">
            Categoría
          </label>
          <Select value={category} onValueChange={(val) => { if (val) onCategoryChange(val) }}>
            <SelectTrigger id="documents-category" className="w-full bg-white">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="documents-status" className="text-sm font-medium text-slate-700">
            Estado
          </label>
          <Select value={status} onValueChange={(value) => {
            if (value === "ALL" || value === "ACTIVE" || value === "ARCHIVED" || value === "RESTRICTED") {
              onStatusChange(value)
            }
          }}>
            <SelectTrigger id="documents-status" className="w-full bg-white">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="documents-sort" className="text-sm font-medium text-slate-700">
            Orden
          </label>
          <Select value={sort} onValueChange={(value) => {
            if (value === "NEWEST" || value === "OLDEST") {
              onSortChange(value)
            }
          }}>
            <SelectTrigger id="documents-sort" className="w-full bg-white">
              <SelectValue placeholder="Más reciente" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button type="button" variant="outline" onClick={onClearFilters} className="w-full lg:w-auto">
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

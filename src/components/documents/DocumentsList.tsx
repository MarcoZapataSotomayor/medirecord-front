import { Link } from "react-router-dom"
import { Eye, FileText, Hash, Share2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MedicalDocument, MedicalDocumentStatus } from "@/types/document"
import { formatLongDate } from "@/utils/dashboard"

interface DocumentsListProps {
  documents: readonly MedicalDocument[]
  onViewHash: (document: MedicalDocument) => void
}

function getStatusBadgeClass(status: MedicalDocumentStatus): string {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"
    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-700"
    case "RESTRICTED":
      return "border-rose-200 bg-rose-50 text-rose-800"
    default:
      return "border-slate-200 bg-slate-100 text-slate-700"
  }
}

function getStatusLabel(status: MedicalDocumentStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Activo"
    case "ARCHIVED":
      return "Archivado"
    case "RESTRICTED":
      return "Restringido"
    default:
      return status
  }
}

export function DocumentsList({ documents, onViewHash }: DocumentsListProps) {
  const abbreviateHash = (hash: string) => {
    if (hash.length <= 10) return hash
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  return (
    <div>
      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
              <TableHead className="w-[30%] text-slate-700 font-semibold">Nombre</TableHead>
              <TableHead className="text-slate-700 font-semibold">Identificador (ID)</TableHead>
              <TableHead className="text-slate-700 font-semibold">Categoría</TableHead>
              <TableHead className="text-slate-700 font-semibold">Fecha</TableHead>
              <TableHead className="text-slate-700 font-semibold">Estado</TableHead>
              <TableHead className="text-slate-700 font-semibold">Hash técnico</TableHead>
              <TableHead className="text-right text-slate-700 font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-slate-50/40">
                <TableCell className="font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
                      <FileText className="size-4" />
                    </div>
                    <span className="truncate max-w-[200px]" title={doc.name}>
                      {doc.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{doc.id}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                    {doc.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{formatLongDate(doc.uploadedAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(doc.status)}>
                    {getStatusLabel(doc.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500" title={doc.documentHash}>
                    <Hash className="size-3 text-slate-400" />
                    <span>{abbreviateHash(doc.documentHash)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/app/documents/${doc.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" }) + " h-8 gap-1.5 text-xs inline-flex items-center"}
                    >
                      <Eye className="size-3.5" />
                      <span>Ver documento</span>
                    </Link>
                    <Button
                      onClick={() => onViewHash(doc)}
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      title="Ver hash técnico"
                    >
                      <Hash className="size-3.5" />
                      <span>Ver hash</span>
                    </Button>
                    <Link
                      to={`/app/documents/${doc.id}/share`}
                      className={buttonVariants({ variant: "outline", size: "sm" }) + " h-8 gap-1.5 text-xs inline-flex items-center"}
                      title="Compartir documento"
                    >
                      <Share2 className="size-3.5" />
                      <span>Compartir</span>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view: Cards list */}
      <div className="grid gap-4 md:hidden">
        {documents.map((doc) => (
          <div key={doc.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-700 shrink-0">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="font-mono text-[10px] text-slate-500 truncate mt-0.5">{doc.id}</p>
                </div>
              </div>
              <Badge variant="outline" className={getStatusBadgeClass(doc.status) + " shrink-0"}>
                {getStatusLabel(doc.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 py-2">
              <div>
                <p className="text-slate-400">Categoría</p>
                <p className="font-medium text-slate-700 mt-0.5">{doc.category}</p>
              </div>
              <div>
                <p className="text-slate-400">Fecha</p>
                <p className="font-medium text-slate-700 mt-0.5">{formatLongDate(doc.uploadedAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Hash técnico</p>
                <p className="font-mono text-[10px] text-slate-600 mt-0.5 break-all">
                  {doc.documentHash}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                to={`/app/documents/${doc.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full justify-center h-9 gap-2 inline-flex items-center"}
              >
                <Eye className="size-4" />
                <span>Ver documento</span>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => onViewHash(doc)}
                  size="sm"
                  variant="outline"
                  className="w-full justify-center h-9 gap-1.5"
                >
                  <Hash className="size-4" />
                  <span>Ver hash</span>
                </Button>
                <Link
                  to={`/app/documents/${doc.id}/share`}
                  className={buttonVariants({ variant: "outline", size: "sm" }) + " w-full justify-center h-9 gap-1.5 inline-flex items-center"}
                  title="Compartir documento"
                >
                  <Share2 className="size-4" />
                  <span>Compartir</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

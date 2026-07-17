import { useEffect, useState, type FormEvent, useRef } from "react"
import { FileUp, FileText, X, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MedicalDocument } from "@/types/document"
import { validateSelectedFile, formatFileSize, generateMockHash } from "@/utils/documents"

interface RegisterDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (input: Omit<MedicalDocument, "id" | "uploadedAt" | "status">) => MedicalDocument
  currentUser: { id: string; fullName: string }
}

type FieldErrors = Partial<Record<"name" | "category" | "file" | "description", string>>

const documentCategories = [
  "Consulta",
  "Constancia",
  "Informe",
  "Seguimiento",
  "Verificación",
  "Receta",
  "Resultado de examen",
  "Informe médico",
  "Otro",
]

export function RegisterDocumentDialog({
  open,
  onOpenChange,
  onRegister,
  currentUser,
}: RegisterDocumentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setSelectedFile(null)
      setName("")
      setCategory("")
      setDescription("")
      setErrors({})
      setIsSubmitting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    const validation = validateSelectedFile(file)
    if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, file: validation.error }))
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } else {
      setSelectedFile(file)
      setErrors((prev) => ({ ...prev, file: undefined }))
      // Autofill document name if empty
      if (!name) {
        const baseName = file.name.replace(/\.[^/.]+$/, "") // remove extension
        setName(baseName)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setErrors((prev) => ({ ...prev, file: undefined }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors: FieldErrors = {}
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!selectedFile) {
      nextErrors.file = "Debe seleccionar un archivo PDF."
    }

    if (!trimmedName) {
      nextErrors.name = "El nombre del documento es obligatorio."
    } else if (trimmedName.length < 3 || trimmedName.length > 100) {
      nextErrors.name = "El nombre debe tener entre 3 y 100 caracteres."
    }

    if (!category) {
      nextErrors.category = "Selecciona una categoría."
    }

    if (trimmedDescription && trimmedDescription.length > 500) {
      nextErrors.description = "La descripción no puede superar los 500 caracteres."
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    // Simulate registration
    onRegister({
      name: trimmedName,
      category,
      description: trimmedDescription || "Sin descripción adicional.",
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      documentHash: generateMockHash(),
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle>Registrar documento</DialogTitle>
          <DialogDescription>
            Registra los metadatos de un nuevo documento médico en modo demostración. No se guardará el archivo PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-900 flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-sky-700 shrink-0 mt-0.5" />
          <p>
            El archivo seleccionado no se almacena. En la integración final será enviado de forma segura al backend y su hash se registrará en Sepolia.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* File Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Archivo PDF</label>
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <FileUp className="size-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">Seleccionar o arrastrar PDF</p>
                <p className="text-xs text-slate-400 mt-1">Solo formato PDF hasta 10 MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="rounded-lg bg-sky-50 p-2 text-sky-700 shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
            {errors.file ? (
              <p className="text-sm text-rose-600 font-medium">{errors.file}</p>
            ) : null}
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <label htmlFor="document-name" className="text-sm font-medium text-slate-700">
              Nombre del documento
            </label>
            <Input
              id="document-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Resumen de atención o Diagnóstico..."
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "document-name-error" : undefined}
              className="bg-white"
            />
            {errors.name ? (
              <p id="document-name-error" className="text-sm text-rose-600 font-medium">
                {errors.name}
              </p>
            ) : null}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="document-category" className="text-sm font-medium text-slate-700">
              Categoría
            </label>
            <Select value={category} onValueChange={(val) => { if (val) setCategory(val) }}>
              <SelectTrigger id="document-category" className="w-full bg-white" aria-invalid={Boolean(errors.category)}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? (
              <p className="text-sm text-rose-600 font-medium">{errors.category}</p>
            ) : null}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="document-description" className="text-sm font-medium text-slate-700">
              Descripción (Opcional)
            </label>
            <textarea
              id="document-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Detalle neutro del documento o notas adicionales..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "document-desc-error" : undefined}
              className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-white resize-none h-20"
            />
            {errors.description ? (
              <p id="document-desc-error" className="text-sm text-rose-600 font-medium">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar documento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState, type FormEvent } from "react"

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
import type { User } from "@/types/user"
import {
  hasDuplicateWallet,
  isValidEthereumWallet,
  type ParticipantRegistrationInput,
} from "@/utils/participants"

interface RegisterParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (input: ParticipantRegistrationInput) => User
  participants: readonly User[]
}

type FieldErrors = Partial<Record<"fullName" | "walletAddress" | "role", string>>

const registerableRoles: ParticipantRegistrationInput["role"][] = [
  "PATIENT",
  "DOCTOR",
  "CLINIC",
  "INSURANCE",
]

export function RegisterParticipantDialog({
  open,
  onOpenChange,
  onRegister,
  participants,
}: RegisterParticipantDialogProps) {
  const [fullName, setFullName] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [role, setRole] = useState<ParticipantRegistrationInput["role"] | "">("")
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (!open) {
      setFullName("")
      setWalletAddress("")
      setRole("")
      setErrors({})
    }
  }, [open])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FieldErrors = {}
    const trimmedName = fullName.trim()
    const trimmedWallet = walletAddress.trim()

    if (trimmedName.length < 3 || trimmedName.length > 120) {
      nextErrors.fullName = "Ingresa un nombre o razón social válido de 3 a 120 caracteres."
    }

    if (!trimmedWallet) {
      nextErrors.walletAddress = "La wallet es obligatoria."
    } else if (!isValidEthereumWallet(trimmedWallet)) {
      nextErrors.walletAddress = "La wallet debe tener formato 0x seguido de 40 caracteres hexadecimales."
    } else if (hasDuplicateWallet(trimmedWallet, participants)) {
      nextErrors.walletAddress = "La wallet ya está registrada."
    }

    if (!role) {
      nextErrors.role = "Selecciona un rol permitido."
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0 || !role) {
      return
    }

    onRegister({
      fullName: trimmedName,
      walletAddress: trimmedWallet,
      role,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar participante</DialogTitle>
          <DialogDescription>
            Crea una cuenta simulada para el panel administrativo. No solicites credenciales
            médicas ni datos sensibles.
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          En la integración final esta operación requerirá confirmación mediante MetaMask y Sepolia ETH.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="participant-full-name" className="text-sm font-medium text-slate-700">
              Nombre o razón social
            </label>
            <Input
              id="participant-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ej. Clínica Horizonte"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "participant-full-name-error" : undefined}
            />
            {errors.fullName ? (
              <p id="participant-full-name-error" className="text-sm text-rose-600">
                {errors.fullName}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="participant-wallet" className="text-sm font-medium text-slate-700">
              Wallet
            </label>
            <Input
              id="participant-wallet"
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              placeholder="0x..."
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors.walletAddress)}
              aria-describedby={errors.walletAddress ? "participant-wallet-error" : undefined}
            />
            {errors.walletAddress ? (
              <p id="participant-wallet-error" className="text-sm text-rose-600">
                {errors.walletAddress}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="participant-role" className="text-sm font-medium text-slate-700">
              Rol
            </label>
            <Select
              value={role}
              onValueChange={(value) => {
                if (
                  value === "PATIENT" ||
                  value === "DOCTOR" ||
                  value === "CLINIC" ||
                  value === "INSURANCE"
                ) {
                  setRole(value)
                }
              }}
            >
              <SelectTrigger id="participant-role" className="w-full bg-white" aria-invalid={Boolean(errors.role)}>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {registerableRoles.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "PATIENT"
                      ? "Paciente"
                      : option === "DOCTOR"
                        ? "Médico"
                        : option === "CLINIC"
                          ? "Clínica"
                          : "Aseguradora"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role ? <p className="text-sm text-rose-600">{errors.role}</p> : null}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar participante</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

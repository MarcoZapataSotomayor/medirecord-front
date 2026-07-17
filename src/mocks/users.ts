import type { User } from "@/types/user"

export const demoUsers = [
  {
    id: "user-admin-001",
    fullName: "Administrador MediRecord",
    role: "ADMIN",
    walletAddress: "0xA1b2C3d4E5f60718293a4B5c6D7e8F9012345678",
    status: "ACTIVE",
  },
  {
    id: "user-patient-001",
    fullName: "Carlos Mendoza",
    role: "PATIENT",
    walletAddress: "0xB2c3D4e5F60718293A4b5C6d7E8f901234567890",
    status: "ACTIVE",
  },
  {
    id: "user-patient-002",
    fullName: "María López",
    role: "PATIENT",
    walletAddress: "0xC3d4E5f60718293a4B5c6D7e8F90123456789012",
    status: "ACTIVE",
  },
  {
    id: "user-doctor-001",
    fullName: "Dr. Luis Ramírez",
    role: "DOCTOR",
    walletAddress: "0xD4e5F60718293A4b5C6d7E8f9012345678901234",
    status: "ACTIVE",
  },
  {
    id: "user-clinic-001",
    fullName: "Clínica San Gabriel",
    role: "CLINIC",
    walletAddress: "0xE5F60718293a4B5c6D7e8F901234567890123456",
    status: "ACTIVE",
  },
  {
    id: "user-insurance-001",
    fullName: "Seguros Vida Salud",
    role: "INSURANCE",
    walletAddress: "0xF60718293A4b5C6d7E8f90123456789012345678",
    status: "ACTIVE",
  },
] satisfies readonly User[]

export const adminUser = demoUsers[0]
export const carlosMendoza = demoUsers[1]
export const mariaLopez = demoUsers[2]
export const luisRamirez = demoUsers[3]
export const clinicaSanGabriel = demoUsers[4]
export const segurosVidaSalud = demoUsers[5]
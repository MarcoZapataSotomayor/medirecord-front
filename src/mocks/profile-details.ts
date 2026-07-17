export interface ProfileDetail {
  userId: string
  specialty?: string
  licenseNumber?: string
  ruc?: string
  institutionalId?: string
  phone: string
  email: string
  address: string
}

export const demoProfileDetails: Record<string, ProfileDetail> = {
  "user-admin-001": {
    userId: "user-admin-001",
    phone: "+51 999 888 777",
    email: "admin@medirecord.edu.pe",
    address: "Campus Universitario UPAO, Trujillo, Perú",
  },
  "user-patient-001": {
    userId: "user-patient-001",
    phone: "+51 987 654 321",
    email: "carlos.mendoza@gmail.com",
    address: "Av. Larco 1230, Trujillo, Perú",
  },
  "user-patient-002": {
    userId: "user-patient-002",
    phone: "+51 955 444 333",
    email: "maria.lopez@outlook.com",
    address: "Calle Los Pinos 452, Trujillo, Perú",
  },
  "user-doctor-001": {
    userId: "user-doctor-001",
    specialty: "Cardiología y Medicina Interna",
    licenseNumber: "CMP 654321 / RNE 98765",
    phone: "+51 912 345 678",
    email: "luis.ramirez@medirecord.edu.pe",
    address: "Consultorio 402, Av. América Oeste, Trujillo, Perú",
  },
  "user-clinic-001": {
    userId: "user-clinic-001",
    ruc: "20123456789",
    institutionalId: "IPRESS-0004321",
    phone: "(044) 608000",
    email: "contacto@clinicasangabriel.com.pe",
    address: "Av. Mansiche 890, Trujillo, Perú",
  },
  "user-insurance-001": {
    userId: "user-insurance-001",
    ruc: "20987654321",
    institutionalId: "SUSALUD-INS-09",
    phone: "(01) 5135000",
    email: "verificaciones@vidasalud.com.pe",
    address: "Av. Victor Larco Herrera 1700, Trujillo, Perú",
  },
}

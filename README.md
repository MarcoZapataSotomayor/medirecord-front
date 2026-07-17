# MediRecord — Portal Descentralizado de Gestión de Autorizaciones Médicas

MediRecord es una plataforma de demostración universitaria diseñada para ilustrar el control de acceso descentralizado sobre registros médicos, permitiendo a los pacientes delegar permisos de visualización a médicos, clínicas y compañías aseguradoras de forma granular, segura y con trazabilidad criptográfica.

## Arquitectura de Privacidad y Blockchain

Para cumplir con las regulaciones internacionales de protección de datos de salud (HIPAA, GDPR) y optimizar el costo de gas en la red:
- **PDFs y Datos Médicos Fuera de Blockchain (Off-chain):** La blockchain de Ethereum Sepolia no almacena archivos PDF, nombres de pacientes, diagnósticos, recetas ni descripciones clínicas. Estos datos permanecen resguardados de forma segura en servidores locales (backend) y son servidos únicamente tras validar la credencial de acceso.
- **Trazabilidad y Permisos en el Registry (On-chain):** El contrato inteligente `MediRecordRegistry` en la red Sepolia actúa como el directorio de control de acceso descentralizado, vinculando las direcciones wallet de los actores.
- **NFT como Credencial de Acceso:** El contrato `MedicalAccessNFT` emite tokens no transferibles que representan la vigencia de una autorización activa para un destinatario sobre un recurso específico.
- **Frontend y MetaMask:** En la integración final, MetaMask gestionará las firmas digitales de los usuarios, y `ethers.js` interactuará directamente con las ABIs de los contratos inteligentes.

> [!WARNING]
> **Modo Demostración Activo:** Actualmente, todas las firmas, estimaciones de gas, hashes y validaciones técnicas son simuladas interactivamente para agilizar la prueba del prototipo universitario.

---

## Tecnologías Utilizadas

- **Framework:** React con TypeScript + Vite.
- **Estilos:** Tailwind CSS v4 para layouts responsivos.
- **Iconografía:** Lucide React.
- **Componentes:** Componentes accesibles e interactivos (inspirados en shadcn/ui).
- **Rutas:** React Router DOM para navegación segura y privada.
- **Notificaciones:** Sonner.

---

## Requisitos de Ejecución

- **Node.js:** Versión 18 o superior.
- **npm:** Versión 9 o superior.

---

## Comandos Principales

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Ejecutar entorno de desarrollo
```bash
npm run dev
```

### 3. Compilar aplicación para producción
```bash
npm run build
```

### 4. Ejecutar análisis de lint (Oxlint)
```bash
npm run lint
```

---

## Cuentas y Roles de Demostración

MediRecord cuenta con 6 perfiles precargados para experimentar los flujos de seguridad:

1. **Administrador** (`user-admin-001`): Registro y visualización general de participantes en la plataforma.
2. **Pacientes:**
   - *Carlos Mendoza* (`user-patient-001`)
   - *María López* (`user-patient-002`)
   Permite subir metadatos de documentos, emitir permisos temporales y revocar accesos.
3. **Médico** — *Dr. Luis Ramírez* (`user-doctor-001`): Consulta clínica de documentos autorizados con simulación de validación técnica.
4. **Clínica / IPS** — *Clínica San Gabriel* (`user-clinic-001`): Acceso institucional autorizado.
5. **Aseguradora** — *Seguros Vida Salud* (`user-insurance-001`): Verificación técnica de cobertura médica.

---

## Rutas Principales de la Aplicación

- `/` — Landing page de presentación pública.
- `/connect` — Selector interactivo de cuentas y simulación de conexión wallet.
- `/app/dashboard` — Métricas y actividad dinámica adaptada por rol.
- `/app/documents` — Subida local de metadatos de archivos (solo Pacientes).
- `/app/permissions` — Gestión e historial de autorizaciones emitidas o recibidas.
- `/app/authorized-documents` — Consulta y auditoría de documentos activos (Destinatarios).
- `/app/activity` — Timeline detallado de acciones y accesos según el rol de la sesión.
- `/app/transactions` — Trazabilidad técnica de hashes y bloques simulados.
- `/app/profile` — Ficha de datos personales y credenciales.
- `/app/settings` — Simulación de red Ethereum Sepolia, restablecimiento de almacenamiento y cierre de sesión.

---

## Persistencia y Privacidad Local

- **sessionStorage:** Todos los datos generados durante la simulación (nuevas autorizaciones emitidas, accesos registrados y transacciones generadas en local) se guardan en el `sessionStorage` del navegador bajo las claves `medirecord-demo-*`.
- **Datos no almacenados:** No se guardan archivos PDF reales, imágenes, Base64 ni blobs en el almacenamiento local.
- **Restablecimiento:** En la pestaña de Configuración, es posible limpiar todas las variables de demostración y retornar la aplicación a su estado de fábrica.

---

## Limitaciones y Advertencias

> [!CAUTION]
> **NO UTILIZAR DATOS MÉDICOS REALES:** Este software es un prototipo con fines estrictamente académicos. No introduzca información personal ni diagnósticos reales de salud en los formularios del sistema.

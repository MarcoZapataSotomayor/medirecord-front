# Instrucciones de desarrollo — MediRecord Frontend

## Contexto general

MediRecord es un proyecto universitario para gestionar autorizaciones de acceso a documentos médicos mediante blockchain.

La blockchain no almacena PDFs, nombres, diagnósticos, rutas de archivos ni información clínica.

La blockchain administra únicamente usuarios técnicos, roles, documentos técnicos, permisos, credenciales NFT y eventos.

Los PDFs y la información médica permanecen en un backend Node.js.

## Alcance actual

Trabajar únicamente en el frontend local.

El proyecto utiliza:

- React
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- React Router DOM
- Lucide React

Por ahora no existe una integración disponible con:

- MetaMask
- ethers.js
- smart contracts
- backend
- base de datos
- PDFs reales

Hasta que se indique lo contrario, utilizar exclusivamente datos simulados y servicios mock.

## Reglas de trabajo

- Antes de modificar, inspeccionar la implementación existente.
- Realizar cambios pequeños, controlados y fáciles de revisar.
- No reescribir archivos completos cuando sea posible hacer cambios puntuales.
- No sobrescribir archivos dentro de `src/components/ui` salvo necesidad comprobada.
- No instalar dependencias.
- No ejecutar `npm install`.
- No ejecutar builds.
- No ejecutar servidores.
- No ejecutar pruebas automáticas.
- No crear commits.
- No realizar push.
- No modificar archivos fuera del frontend.
- No implementar funcionalidades no solicitadas.
- No crear pantallas adicionales sin autorización.
- No dejar código muerto ni archivos vacíos sin finalidad.
- Mantener todos los textos visibles en español.
- Explicar al finalizar qué archivos fueron creados o modificados.

## Arquitectura del frontend

El frontend es únicamente una capa de presentación e interacción.

No debe:

- almacenar PDFs;
- decidir por sí solo si un permiso es válido;
- asumir que una wallet está autorizada;
- sustituir las validaciones del Registry;
- sustituir las validaciones del backend;
- exponer información médica sensible.

La integración futura tendrá estas fuentes:

- Registry: roles, documentos técnicos, permisos y eventos.
- MedicalAccessNFT: estado técnico de credenciales.
- Backend: PDFs, nombres, categorías, descripciones y metadatos privados.

## Roles

Una cuenta solo puede tener uno de estos roles:

- ADMIN
- PATIENT
- DOCTOR
- CLINIC
- INSURANCE

No implementar selección libre de rol en producción.

Durante el desarrollo puede existir un selector temporal claramente identificado como `Modo demostración`.

## Reglas por rol

### Administrador

Puede:

- registrar participantes;
- asignar un rol al registrar;
- consultar participantes;
- consultar documentos técnicos;
- consultar permisos;
- consultar actividad.

No puede:

- subir documentos como paciente;
- emitir permisos médicos;
- revocar permisos médicos de pacientes;
- acceder a PDFs únicamente por ser administrador.

### Paciente

Puede:

- subir documentos;
- consultar sus documentos;
- otorgar permisos;
- consultar permisos emitidos;
- revocar permisos activos emitidos por él;
- consultar historial relacionado con sus documentos.

### Médico

Puede:

- consultar documentos compartidos con su wallet;
- revisar permisos recibidos;
- validar permisos;
- registrar consultas cuando corresponda;
- consultar su historial.

No puede emitir, modificar, revocar ni transferir permisos.

### Clínica

Comparte la lógica de consulta del médico, pero con perfil institucional.

### Aseguradora

Puede consultar documentos y permisos relacionados con verificaciones, coberturas y auditorías, pero no puede modificarlos.

## Reglas de permisos

Los estados permitidos son:

- ACTIVE
- EXPIRED
- REVOKED

Solo un paciente puede emitir permisos.

Los destinatarios permitidos son:

- DOCTOR
- CLINIC
- INSURANCE

No permitir:

- autoautorización;
- autorización a otro paciente;
- autorización al administrador;
- fecha de expiración pasada;
- edición de un permiso ya emitido;
- transferencia de la credencial NFT.

Solo el paciente emisor puede revocar un permiso activo.

## Operaciones blockchain futuras

Distinguir siempre entre operaciones de lectura y escritura.

Lectura:

- consultar rol;
- consultar documentos técnicos;
- consultar permisos;
- validar estado.

No requieren firma ni gas.

Escritura:

- registrar participante;
- registrar documento técnico;
- emitir permiso;
- revocar permiso;
- registrar consulta.

Requieren confirmación de MetaMask y Sepolia ETH.

## Estados de transacción

Preparar la interfaz para:

- IDLE
- AWAITING_SIGNATURE
- SUBMITTED
- CONFIRMING
- CONFIRMED
- REJECTED
- FAILED

Una transacción confirmada podrá mostrar:

- hash;
- bloque;
- gas utilizado;
- enlace a Sepolia Etherscan.

## Estados de wallet

Preparar la interfaz para:

- MetaMask no instalada;
- wallet desconectada;
- conectando;
- red incorrecta;
- Sepolia conectada;
- usuario no registrado;
- cuenta autorizada.

La interfaz futura deberá reaccionar a cambios de cuenta y red.

## Diseño

La interfaz debe parecer un software médico moderno, no un explorador blockchain.

Utilizar:

- fondo gris azulado claro;
- superficies blancas;
- azul profundo o azul petróleo como color principal;
- verde para estados activos;
- ámbar para advertencias y expiración;
- rojo para errores y revocación;
- tarjetas limpias;
- bordes suaves;
- sombras discretas;
- diseño responsive.

Evitar:

- criptomonedas como elemento visual principal;
- degradados morados excesivos;
- neón;
- animaciones innecesarias;
- jerga blockchain en títulos principales.

Usar términos amigables:

- `Credencial de acceso` en lugar de NFT como título principal.
- `Cuenta digital` cuando sea apropiado.
- `Código de transacción` en lugar de transaction hash como etiqueta principal.
- Los detalles técnicos pueden mostrarse en secciones secundarias.

## Componentes

Reutilizar componentes de shadcn/ui.

Evitar crear componentes monolíticos.

Separar:

- páginas;
- layouts;
- navegación;
- componentes comunes;
- tipos;
- mocks;
- servicios;
- guards;
- hooks;
- utilidades.

Usar tipado estricto y evitar `any`.
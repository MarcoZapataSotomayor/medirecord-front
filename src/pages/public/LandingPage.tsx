import { Link } from "react-router-dom"
import {
  ArrowRight,
  BadgeCheck,
  FileLock2,
  Landmark,
  ShieldCheck,
  Stethoscope,
  Workflow,
  ShieldUser,
  Hospital,
  UserRoundCog,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { PageContainer } from "@/components/common/PageContainer"
import { cn } from "@/lib/utils"

const trustPoints = [
  {
    title: "Control del paciente",
    description: "La persona titular decide qué cuenta puede consultar su información.",
    icon: <ShieldUser className="size-5" aria-hidden="true" />,
  },
  {
    title: "Autorizaciones verificables",
    description: "Cada permiso queda trazado para revisión pública de la operación.",
    icon: <BadgeCheck className="size-5" aria-hidden="true" />,
  },
  {
    title: "Documentos protegidos fuera de blockchain",
    description: "La cadena solo administra permisos y eventos técnicos, no PDFs.",
    icon: <FileLock2 className="size-5" aria-hidden="true" />,
  },
  {
    title: "Trazabilidad de operaciones",
    description: "La experiencia deja claro qué se conectó, consultó o autorizó.",
    icon: <Workflow className="size-5" aria-hidden="true" />,
  },
]

const processSteps = [
  "Conecta tu cuenta.",
  "Consulta tu rol.",
  "Administra o recibe autorizaciones.",
  "Accede a documentos protegidos.",
]

const roles = [
  {
    title: "Administrador",
    description: "Gestión administrativa de participantes, actividad y revisión general.",
    icon: <UserRoundCog className="size-5" aria-hidden="true" />,
  },
  {
    title: "Paciente",
    description: "Controla sus documentos y autoriza el acceso a quienes corresponda.",
    icon: <ShieldCheck className="size-5" aria-hidden="true" />,
  },
  {
    title: "Médico",
    description: "Consulta información autorizada y registra actividad cuando procede.",
    icon: <Stethoscope className="size-5" aria-hidden="true" />,
  },
  {
    title: "Clínica",
    description: "Opera con una lógica institucional para consultas autorizadas.",
    icon: <Hospital className="size-5" aria-hidden="true" />,
  },
  {
    title: "Aseguradora",
    description: "Revisa documentos y permisos para verificaciones y auditorías.",
    icon: <Landmark className="size-5" aria-hidden="true" />,
  },
]

const benefits = ["Privacidad", "Control", "Trazabilidad", "Experiencia sencilla"]

const technologies = ["React", "MetaMask", "Ethereum Sepolia", "Node.js"]

export function LandingPage() {
  return (
    <PageContainer className="space-y-16 py-14 sm:py-16 lg:py-20">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="space-y-6">
          <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800">
            Capa pública de demostración
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Tus documentos médicos, compartidos bajo tu autorización.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              MediRecord permite administrar autorizaciones de acceso sin almacenar
              información clínica en blockchain. Los documentos permanecen fuera de la
              cadena y la plataforma muestra solo la trazabilidad técnica necesaria.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/connect" className={buttonVariants({ size: "lg" })}>
              Conectar cuenta digital
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#proceso" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Conocer el proceso
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((point) => (
              <Card key={point.title} size="sm" className="border-slate-200/80 bg-white/90">
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                    {point.icon}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{point.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{point.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <CardHeader className="space-y-2 border-b border-slate-100">
            <CardTitle className="text-slate-900">Demostración pública</CardTitle>
            <CardDescription>
              Una vista clara del flujo inicial antes de acceder al área privada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Flujo preparado
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                Conexión simulada y validación de cuenta
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                La interfaz pública guía al usuario antes de entrar al dashboard que se
                habilitará en el siguiente bloque.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                  {benefit}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-800">Tecnologías discretas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <Badge key={technology} variant="secondary" className="bg-slate-100 text-slate-700">
                    {technology}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section id="proceso" className="space-y-6 scroll-mt-28">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Cómo funciona
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
            Un recorrido breve, entendible y orientado al paciente
          </h2>
          <p className="text-slate-600">
            La experiencia pública prepara la sesión antes de entrar a los módulos
            privados de MediRecord.
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, index) => (
            <li key={step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="font-medium text-slate-900">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            Roles soportados
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
            Cada cuenta entra con una función clara
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {roles.map((role) => (
            <Card key={role.title} className="border-slate-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  {role.icon}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{role.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{role.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-slate-900">Beneficios</CardTitle>
            <CardDescription>
              La propuesta se centra en lo que una persona necesita entender al entrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
                {benefit}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95">
          <CardHeader>
            <CardTitle className="text-slate-900">Tecnologías visibles</CardTitle>
            <CardDescription>
              La capa pública muestra el stack técnico sin volverlo el protagonista.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <Badge
                  key={technology}
                  variant="outline"
                  className={cn("border-slate-200 bg-white text-slate-700")}
                >
                  {technology}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border border-teal-200 bg-teal-950 px-6 py-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] sm:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
            Inicio rápido
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Conecta tu cuenta y continúa con la demostración
          </h2>
          <p className="max-w-2xl text-teal-50/85">
            El siguiente paso prepara la validación simulada de MetaMask y la consulta del rol
            antes de habilitar el área privada.
          </p>
          <div className="pt-2">
            <Link to="/connect" className={buttonVariants({ size: "lg" })}>
              Comenzar con MetaMask
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
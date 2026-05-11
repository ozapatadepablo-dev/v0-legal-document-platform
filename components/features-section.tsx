'use client'

import { FileSearch, Brain, Shield, Zap, Clock, Download } from 'lucide-react'

const features = [
  {
    icon: FileSearch,
    title: 'Extracción Inteligente',
    description: 'Identifica automáticamente partes, montos, plazos e información del inmueble',
  },
  {
    icon: Brain,
    title: 'Análisis con IA',
    description: 'Powered by Google Gemini para análisis preciso de documentos legales chilenos',
  },
  {
    icon: Shield,
    title: 'Documentos Soportados',
    description: 'Inscripciones de dominio, compraventas, mandatos, hipotecas y más',
  },
  {
    icon: Zap,
    title: 'Procesamiento Rápido',
    description: 'Análisis completo en segundos, no en horas de revisión manual',
  },
  {
    icon: Clock,
    title: 'Historial de Análisis',
    description: 'Guarda y accede a tus análisis previos cuando lo necesites',
  },
  {
    icon: Download,
    title: 'Exportación',
    description: 'Descarga los resultados en formato JSON para integración con otros sistemas',
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Análisis legal simplificado
          </h2>
          <p className="mt-3 text-muted-foreground">
            Herramientas diseñadas específicamente para el derecho inmobiliario chileno
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

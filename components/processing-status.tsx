'use client'

import { Loader2, CheckCircle2, XCircle, FileSearch, Brain, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProcessingStage = 'uploading' | 'extracting' | 'analyzing' | 'completed' | 'error'

interface ProcessingStatusProps {
  stage: ProcessingStage
  error?: string | null
}

const stages = [
  { id: 'uploading', label: 'Cargando documento', icon: FileText },
  { id: 'extracting', label: 'Extrayendo texto', icon: FileSearch },
  { id: 'analyzing', label: 'Analizando con IA', icon: Brain },
]

export function ProcessingStatus({ stage, error }: ProcessingStatusProps) {
  const getStageIndex = (s: ProcessingStage): number => {
    if (s === 'completed' || s === 'error') return stages.length
    return stages.findIndex(st => st.id === s)
  }

  const currentIndex = getStageIndex(stage)

  if (stage === 'error') {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Error en el procesamiento</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || 'Ocurrió un error al procesar el documento. Por favor, intente nuevamente.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'completed') {
    return (
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-accent">Análisis completado</h3>
            <p className="text-sm text-muted-foreground">
              El documento ha sido procesado exitosamente
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-medium text-foreground">Procesando documento...</span>
        </div>

        <div className="space-y-3">
          {stages.map((s, index) => {
            const Icon = s.icon
            const isActive = index === currentIndex
            const isCompleted = index < currentIndex
            const isPending = index > currentIndex

            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 transition-all",
                  isActive && "bg-primary/10",
                  isCompleted && "bg-accent/10",
                  isPending && "opacity-50"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  isActive && "bg-primary/20",
                  isCompleted && "bg-accent/20",
                  isPending && "bg-muted"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isActive && "text-primary",
                  isCompleted && "text-accent",
                  isPending && "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

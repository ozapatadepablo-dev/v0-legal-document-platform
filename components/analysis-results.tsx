'use client'

import { 
  FileText, 
  Users, 
  MapPin, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Building,
  ScrollText,
  Scale,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AnalysisResult, DocumentType } from '@/lib/types'
import { useState } from 'react'

interface AnalysisResultsProps {
  result: AnalysisResult
}

const documentTypeLabels: Record<DocumentType, string> = {
  inscripcion_dominio: 'Inscripción de Dominio',
  compraventa: 'Compraventa',
  mandato: 'Mandato',
  hipoteca: 'Hipoteca',
  prohibicion: 'Prohibición',
  usufructo: 'Usufructo',
  servidumbre: 'Servidumbre',
  otro: 'Otro Documento',
}

const documentTypeColors: Record<DocumentType, string> = {
  inscripcion_dominio: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  compraventa: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  mandato: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  hipoteca: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  prohibicion: 'bg-destructive/10 text-destructive border-destructive/20',
  usufructo: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  servidumbre: 'bg-primary/10 text-primary border-primary/20',
  otro: 'bg-muted text-muted-foreground border-border',
}

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </CardTitle>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  )
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const { extractedData, summary, documentType, confidence } = result

  return (
    <div className="space-y-6">
      {/* Header with document type and confidence */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <Badge 
              variant="outline" 
              className={cn("mb-1", documentTypeColors[documentType])}
            >
              {documentTypeLabels[documentType]}
            </Badge>
            {extractedData.fechaDocumento && (
              <p className="text-sm text-muted-foreground">
                Fecha: {extractedData.fechaDocumento}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Confianza del análisis</p>
          <p className={cn(
            "text-2xl font-bold",
            confidence >= 0.8 ? "text-accent" : confidence >= 0.5 ? "text-chart-4" : "text-destructive"
          )}>
            {Math.round(confidence * 100)}%
          </p>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed text-foreground">{summary}</p>
        </CardContent>
      </Card>

      {/* Notary */}
      {extractedData.notaria && (
        <CollapsibleSection title="Notaría" icon={Building}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Notario</p>
              <p className="font-medium text-foreground">{extractedData.notaria.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ciudad</p>
              <p className="font-medium text-foreground">{extractedData.notaria.ciudad}</p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Parties */}
      {extractedData.partes && extractedData.partes.length > 0 && (
        <CollapsibleSection title="Partes Involucradas" icon={Users}>
          <div className="space-y-4">
            {extractedData.partes.map((parte, index) => (
              <div 
                key={index} 
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {parte.rol}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium text-foreground">{parte.nombre}</p>
                  </div>
                  {parte.rut && (
                    <div>
                      <p className="text-sm text-muted-foreground">RUT</p>
                      <p className="font-mono text-foreground">{parte.rut}</p>
                    </div>
                  )}
                  {parte.domicilio && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Domicilio</p>
                      <p className="text-foreground">{parte.domicilio}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Property */}
      {extractedData.inmueble && (
        <CollapsibleSection title="Información del Inmueble" icon={MapPin}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {extractedData.inmueble.direccion && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium text-foreground">{extractedData.inmueble.direccion}</p>
                </div>
              )}
              {extractedData.inmueble.comuna && (
                <div>
                  <p className="text-sm text-muted-foreground">Comuna</p>
                  <p className="text-foreground">{extractedData.inmueble.comuna}</p>
                </div>
              )}
              {extractedData.inmueble.region && (
                <div>
                  <p className="text-sm text-muted-foreground">Región</p>
                  <p className="text-foreground">{extractedData.inmueble.region}</p>
                </div>
              )}
              {extractedData.inmueble.rolAvaluo && (
                <div>
                  <p className="text-sm text-muted-foreground">Rol de Avalúo</p>
                  <p className="font-mono text-foreground">{extractedData.inmueble.rolAvaluo}</p>
                </div>
              )}
              {extractedData.inmueble.superficie && (
                <div>
                  <p className="text-sm text-muted-foreground">Superficie</p>
                  <p className="text-foreground">{extractedData.inmueble.superficie}</p>
                </div>
              )}
            </div>

            {extractedData.inmueble.deslindes && (
              <div>
                <p className="text-sm text-muted-foreground">Deslindes</p>
                <p className="text-sm text-foreground">{extractedData.inmueble.deslindes}</p>
              </div>
            )}

            {extractedData.inmueble.inscripcion && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="mb-2 text-sm font-medium text-primary">Inscripción CBR</p>
                <div className="grid gap-2 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">CBR</p>
                    <p className="font-medium text-foreground">{extractedData.inmueble.inscripcion.cbr}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fojas</p>
                    <p className="font-mono text-foreground">{extractedData.inmueble.inscripcion.fojas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Número</p>
                    <p className="font-mono text-foreground">{extractedData.inmueble.inscripcion.numero}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Año</p>
                    <p className="font-mono text-foreground">{extractedData.inmueble.inscripcion.ano}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Clauses */}
      {extractedData.clausulas && extractedData.clausulas.length > 0 && (
        <CollapsibleSection title="Cláusulas Principales" icon={ScrollText}>
          <div className="space-y-3">
            {extractedData.clausulas.map((clausula, index) => (
              <div key={index} className="rounded-lg border border-border p-4">
                <Badge variant="outline" className="mb-2 capitalize">
                  {clausula.tipo}
                </Badge>
                <p className="text-sm text-foreground">{clausula.descripcion}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Amounts */}
      {extractedData.montos && extractedData.montos.length > 0 && (
        <CollapsibleSection title="Montos" icon={DollarSign}>
          <div className="divide-y divide-border">
            {extractedData.montos.map((monto, index) => (
              <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-muted-foreground">{monto.concepto}</span>
                <span className="font-semibold text-foreground">
                  {monto.moneda} {monto.monto}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Deadlines */}
      {extractedData.plazos && extractedData.plazos.length > 0 && (
        <CollapsibleSection title="Plazos" icon={Clock}>
          <div className="space-y-3">
            {extractedData.plazos.map((plazo, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border border-border p-4">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-foreground">{plazo.descripcion}</p>
                  {plazo.fecha && (
                    <p className="mt-1 text-sm font-medium text-primary">{plazo.fecha}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Observations */}
      {extractedData.observaciones && extractedData.observaciones.length > 0 && (
        <CollapsibleSection title="Observaciones" icon={AlertTriangle} defaultOpen={true}>
          <div className="space-y-2">
            {extractedData.observaciones.map((obs, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 rounded-lg bg-chart-4/10 p-3"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-chart-4" />
                <p className="text-sm text-foreground">{obs}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}

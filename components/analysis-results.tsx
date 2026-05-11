'use client'

import { AnalysisType, LegalAnalysisResult } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertCircle, ChevronDown, Download, Info, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysisResultsProps {
  result: LegalAnalysisResult
  onExport: () => void
}

export function AnalysisResults({ result, onExport }: AnalysisResultsProps) {
  const { analysisType, documentType, summary, informe, confidence, extractedData } = result

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500/20 text-green-700 border-green-200'
    if (conf >= 0.6) return 'bg-yellow-500/20 text-yellow-700 border-yellow-200'
    return 'bg-red-500/20 text-red-700 border-red-200'
  }

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return 'Alto'
    if (conf >= 0.6) return 'Medio'
    return 'Bajo'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Análisis Completado</h2>
            <p className="text-sm text-muted-foreground">
              {documentType} • {new Date().toLocaleDateString('es-CL')}
            </p>
          </div>
          <Button onClick={onExport} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary">Tipo: {documentType}</Badge>
          <Badge variant="secondary">Análisis: {analysisType}</Badge>
          <div
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium border',
              getConfidenceColor(confidence)
            )}
          >
            Confianza: {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen Ejecutivo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Full Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informe Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{informe}</p>
        </CardContent>
      </Card>

      {/* Extracted Data */}
      {extractedData && (
        <div className="space-y-4">
          {/* Document Type and Date */}
          {(extractedData.tipoDocumento || extractedData.fechaDocumento) && (
            <Collapsible defaultOpen>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Información del Documento</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 border-t pt-4">
                    {extractedData.tipoDocumento && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Tipo de Documento</p>
                        <p className="text-sm text-foreground">{extractedData.tipoDocumento}</p>
                      </div>
                    )}
                    {extractedData.fechaDocumento && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Fecha</p>
                        <p className="text-sm text-foreground">{extractedData.fechaDocumento}</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Notary Information */}
          {extractedData.notaria && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Información de Notaría</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 border-t pt-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Notario</p>
                      <p className="text-sm text-foreground">{extractedData.notaria.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Ciudad</p>
                      <p className="text-sm text-foreground">{extractedData.notaria.ciudad}</p>
                    </div>
                    {extractedData.notaria.repertorio && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Repertorio</p>
                        <p className="text-sm text-foreground">{extractedData.notaria.repertorio}</p>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Parties */}
          {extractedData.partes && extractedData.partes.length > 0 && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Partes Involucradas</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 border-t pt-4">
                    {extractedData.partes.map((parte, idx) => (
                      <div key={idx} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                        <p className="text-xs font-semibold text-primary uppercase">{parte.rol}</p>
                        <div>
                          <p className="text-xs text-muted-foreground">Nombre</p>
                          <p className="text-sm text-foreground">{parte.nombre}</p>
                        </div>
                        {parte.rut && (
                          <div>
                            <p className="text-xs text-muted-foreground">RUT</p>
                            <p className="text-sm text-foreground">{parte.rut}</p>
                          </div>
                        )}
                        {parte.domicilio && (
                          <div>
                            <p className="text-xs text-muted-foreground">Domicilio</p>
                            <p className="text-sm text-foreground">{parte.domicilio}</p>
                          </div>
                        )}
                        {parte.estadoCivil && (
                          <div>
                            <p className="text-xs text-muted-foreground">Estado Civil</p>
                            <p className="text-sm text-foreground">{parte.estadoCivil}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Real Estate */}
          {extractedData.inmueble && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Información del Inmueble</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 border-t pt-4">
                    {extractedData.inmueble.direccion && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Dirección</p>
                        <p className="text-sm text-foreground">{extractedData.inmueble.direccion}</p>
                      </div>
                    )}
                    {extractedData.inmueble.comuna && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Comuna</p>
                        <p className="text-sm text-foreground">{extractedData.inmueble.comuna}</p>
                      </div>
                    )}
                    {extractedData.inmueble.region && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Región</p>
                        <p className="text-sm text-foreground">{extractedData.inmueble.region}</p>
                      </div>
                    )}
                    {extractedData.inmueble.rolAvaluo && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Rol de Avalúo</p>
                        <p className="text-sm text-foreground">{extractedData.inmueble.rolAvaluo}</p>
                      </div>
                    )}
                    {extractedData.inmueble.deslindes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Deslindes</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{extractedData.inmueble.deslindes}</p>
                      </div>
                    )}
                    {extractedData.inmueble.inscripcion && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-xs font-semibold text-primary mb-2">Inscripción CBR</p>
                        {extractedData.inmueble.inscripcion.cbr && (
                          <div>
                            <p className="text-xs text-muted-foreground">CBR</p>
                            <p className="text-sm text-foreground">{extractedData.inmueble.inscripcion.cbr}</p>
                          </div>
                        )}
                        {extractedData.inmueble.inscripcion.fojas && (
                          <div>
                            <p className="text-xs text-muted-foreground">Fojas</p>
                            <p className="text-sm text-foreground">{extractedData.inmueble.inscripcion.fojas}</p>
                          </div>
                        )}
                        {extractedData.inmueble.inscripcion.numero && (
                          <div>
                            <p className="text-xs text-muted-foreground">Número</p>
                            <p className="text-sm text-foreground">{extractedData.inmueble.inscripcion.numero}</p>
                          </div>
                        )}
                        {extractedData.inmueble.inscripcion.ano && (
                          <div>
                            <p className="text-xs text-muted-foreground">Año</p>
                            <p className="text-sm text-foreground">{extractedData.inmueble.inscripcion.ano}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Clauses */}
          {extractedData.clausulas && extractedData.clausulas.length > 0 && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Cláusulas Principales</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 border-t pt-4">
                    {extractedData.clausulas.map((clausula, idx) => (
                      <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                        <p className="text-xs font-semibold text-primary">{clausula.tipo}</p>
                        <p className="text-sm text-foreground mt-1">{clausula.descripcion}</p>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Amounts */}
          {extractedData.montos && extractedData.montos.length > 0 && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Montos y Valores</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 border-t pt-4">
                    {extractedData.montos.map((monto, idx) => (
                      <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">{monto.concepto}</p>
                            {monto.formaPago && (
                              <p className="text-xs text-muted-foreground mt-1">Forma: {monto.formaPago}</p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {monto.monto} {monto.moneda}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Alerts */}
          {extractedData.alertas && extractedData.alertas.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Alertas y Observaciones</h3>
              {extractedData.alertas.map((alerta, idx) => {
                let bgColor = 'bg-chart-4/10'
                let iconComponent = AlertCircle
                let iconColor = 'text-chart-4'

                const tipoStr = String(alerta.tipo || 'warning').toLowerCase()
                if (tipoStr === 'error') {
                  bgColor = 'bg-destructive/10'
                  iconComponent = ShieldAlert
                  iconColor = 'text-destructive'
                } else if (tipoStr === 'info') {
                  bgColor = 'bg-primary/10'
                  iconComponent = Info
                  iconColor = 'text-primary'
                }

                const AlertIcon = iconComponent

                return (
                  <div key={idx} className={cn('flex items-start gap-3 rounded-lg p-4', bgColor)}>
                    <AlertIcon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor)} />
                    <p className="text-sm text-foreground">{String(alerta.mensaje || alerta)}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Observations */}
          {extractedData.observaciones && extractedData.observaciones.length > 0 && (
            <Collapsible>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Observaciones</CardTitle>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 border-t pt-4">
                    {extractedData.observaciones.map((obs, idx) => (
                      <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                        <p className="text-sm text-foreground">{obs}</p>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  )
}

export { AnalysisResults }

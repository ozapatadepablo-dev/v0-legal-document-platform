'use client'

import { 
  FileText, 
  Users, 
  MapPin, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Building,
  Building2,
  ScrollText,
  Scale,
  ChevronDown,
  Stamp,
  ShieldAlert,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AnalysisResult } from '@/lib/types'
import { useState } from 'react'

interface AnalysisResultsProps {
  result: AnalysisResult
}

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  variant = 'default'
}: { 
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
  variant?: 'default' | 'primary' | 'warning'
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const variantStyles = {
    default: '',
    primary: 'border-primary/20 bg-primary/5',
    warning: 'border-chart-4/20 bg-chart-4/5'
  }

  return (
    <Card className={variantStyles[variant]}>
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
  const { extractedData, summary, informe, documentType, confidence, analysisType } = result

  return (
    <div className="space-y-6">
      {/* Header with document type and confidence */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap gap-2">
              <Badge variant="default">
                {analysisType || documentType}
              </Badge>
              <Badge variant="outline">
                {extractedData.tipoDocumento}
              </Badge>
            </div>
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

      {/* Alerts */}
      {extractedData.alertas && extractedData.alertas.length > 0 && (
        <div className="space-y-2">
          {extractedData.alertas.map((alerta, index) => {
            if (!alerta || !alerta.mensaje) return null
            
            const alertStyles: Record<string, { bg: string; icon: any; color: string }> = {
              info: { bg: 'bg-primary/10', icon: Info, color: 'text-primary' },
              warning: { bg: 'bg-chart-4/10', icon: AlertCircle, color: 'text-chart-4' },
              error: { bg: 'bg-destructive/10', icon: ShieldAlert, color: 'text-destructive' }
            }
            
            const alertType = String(alerta.tipo || 'warning').toLowerCase()
            const style = alertStyles[alertType] || alertStyles.warning
            
            if (!style || !style.icon) {
              return (
                <div key={index} className="flex items-start gap-3 rounded-lg p-4 bg-chart-4/10">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-chart-4" />
                  <p className="text-sm text-foreground">{alerta.mensaje}</p>
                </div>
              )
            }
            
            const AlertIcon = style.icon
            
            return (
              <div key={index} className={cn("flex items-start gap-3 rounded-lg p-4", style.bg)}>
                <AlertIcon className={cn("mt-0.5 h-5 w-5 shrink-0", style.color)} />
                <p className="text-sm text-foreground">{alerta.mensaje}</p>
              </div>
            )
          })}
        </div>
      )}

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

      {/* Full Report */}
      {informe && (
        <CollapsibleSection title="Informe Completo" icon={ScrollText} defaultOpen={true} variant="primary">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 font-sans text-sm leading-relaxed text-foreground">
              {informe}
            </pre>
          </div>
        </CollapsibleSection>
      )}

      {/* Literal Transcription (for dominio_vigente) */}
      {extractedData.transcripcionLiteral && (
        <CollapsibleSection title="Transcripción Literal" icon={FileText} defaultOpen={false}>
          <div className="rounded-lg bg-muted/50 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {extractedData.transcripcionLiteral}
            </pre>
          </div>
        </CollapsibleSection>
      )}

      {/* Form of Acquisition */}
      {extractedData.formaAdquisicion && (
        <CollapsibleSection title="Forma de Adquisición" icon={ScrollText}>
          <div className="grid gap-4 sm:grid-cols-2">
            {extractedData.formaAdquisicion.tipo && (
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium text-foreground">{extractedData.formaAdquisicion.tipo}</p>
              </div>
            )}
            {extractedData.formaAdquisicion.escritura && (
              <div>
                <p className="text-sm text-muted-foreground">Escritura</p>
                <p className="text-foreground">{extractedData.formaAdquisicion.escritura}</p>
              </div>
            )}
            {extractedData.formaAdquisicion.notaria && (
              <div>
                <p className="text-sm text-muted-foreground">Notaría</p>
                <p className="text-foreground">{extractedData.formaAdquisicion.notaria}</p>
              </div>
            )}
            {extractedData.formaAdquisicion.fecha && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="text-foreground">{extractedData.formaAdquisicion.fecha}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Notary */}
      {extractedData.notaria && (
        <CollapsibleSection title="Notaría" icon={Building}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Notario</p>
              <p className="font-medium text-foreground">{extractedData.notaria.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ciudad</p>
              <p className="font-medium text-foreground">{extractedData.notaria.ciudad}</p>
            </div>
            {extractedData.notaria.repertorio && (
              <div>
                <p className="text-sm text-muted-foreground">Repertorio</p>
                <p className="font-mono text-foreground">{extractedData.notaria.repertorio}</p>
              </div>
            )}
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
                  {parte.estadoCivil && (
                    <div>
                      <p className="text-sm text-muted-foreground">Estado Civil</p>
                      <p className="text-foreground">{parte.estadoCivil}</p>
                    </div>
                  )}
                  {parte.representante && (
                    <div>
                      <p className="text-sm text-muted-foreground">Representante</p>
                      <p className="text-foreground">{parte.representante}</p>
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

      {/* Society Information */}
      {extractedData.sociedad && (
        <CollapsibleSection title="Información Societaria" icon={Building2}>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-3">
              {extractedData.sociedad.razonSocial && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Razón Social</p>
                  <p className="font-medium text-foreground">{extractedData.sociedad.razonSocial}</p>
                </div>
              )}
              {extractedData.sociedad.rut && (
                <div>
                  <p className="text-sm text-muted-foreground">RUT</p>
                  <p className="font-mono text-foreground">{extractedData.sociedad.rut}</p>
                </div>
              )}
              {extractedData.sociedad.tipoSociedad && (
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Sociedad</p>
                  <Badge variant="outline">{extractedData.sociedad.tipoSociedad}</Badge>
                </div>
              )}
            </div>

            {/* Constitution */}
            {extractedData.sociedad.constitucion && (
              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-sm font-medium text-primary">Constitución</p>
                <div className="grid gap-2 text-sm sm:grid-cols-3">
                  {extractedData.sociedad.constitucion.fecha && (
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="text-foreground">{extractedData.sociedad.constitucion.fecha}</p>
                    </div>
                  )}
                  {extractedData.sociedad.constitucion.notaria && (
                    <div>
                      <p className="text-muted-foreground">Notaría</p>
                      <p className="text-foreground">{extractedData.sociedad.constitucion.notaria}</p>
                    </div>
                  )}
                  {extractedData.sociedad.constitucion.repertorio && (
                    <div>
                      <p className="text-muted-foreground">Repertorio</p>
                      <p className="font-mono text-foreground">{extractedData.sociedad.constitucion.repertorio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Publication */}
            {extractedData.sociedad.publicacion && (
              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-sm font-medium text-primary">Publicación Diario Oficial</p>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  {extractedData.sociedad.publicacion.diarioOficial && (
                    <div>
                      <p className="text-muted-foreground">Número</p>
                      <p className="text-foreground">{extractedData.sociedad.publicacion.diarioOficial}</p>
                    </div>
                  )}
                  {extractedData.sociedad.publicacion.fecha && (
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="text-foreground">{extractedData.sociedad.publicacion.fecha}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commercial Registry */}
            {extractedData.sociedad.inscripcionComercio && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="mb-3 text-sm font-medium text-primary">Inscripción Registro de Comercio</p>
                <div className="grid gap-2 text-sm sm:grid-cols-4">
                  {extractedData.sociedad.inscripcionComercio.cbr && (
                    <div>
                      <p className="text-muted-foreground">CBR</p>
                      <p className="text-foreground">{extractedData.sociedad.inscripcionComercio.cbr}</p>
                    </div>
                  )}
                  {extractedData.sociedad.inscripcionComercio.fojas && (
                    <div>
                      <p className="text-muted-foreground">Fojas</p>
                      <p className="font-mono text-foreground">{extractedData.sociedad.inscripcionComercio.fojas}</p>
                    </div>
                  )}
                  {extractedData.sociedad.inscripcionComercio.numero && (
                    <div>
                      <p className="text-muted-foreground">Número</p>
                      <p className="font-mono text-foreground">{extractedData.sociedad.inscripcionComercio.numero}</p>
                    </div>
                  )}
                  {extractedData.sociedad.inscripcionComercio.ano && (
                    <div>
                      <p className="text-muted-foreground">Año</p>
                      <p className="font-mono text-foreground">{extractedData.sociedad.inscripcionComercio.ano}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vigency */}
            {extractedData.sociedad.vigencia && (
              <div className="flex items-center gap-3 rounded-lg bg-accent/10 p-4">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-foreground">
                    {extractedData.sociedad.vigencia.estado || 'Vigente'}
                  </p>
                  {extractedData.sociedad.vigencia.certificadoFecha && (
                    <p className="text-sm text-muted-foreground">
                      Certificado de fecha: {extractedData.sociedad.vigencia.certificadoFecha}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Modifications */}
            {extractedData.sociedad.modificaciones && extractedData.sociedad.modificaciones.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Modificaciones</p>
                <div className="space-y-2">
                  {extractedData.sociedad.modificaciones.map((mod, idx) => (
                    <div key={idx} className="rounded-lg border border-border p-3 text-sm">
                      <div className="flex flex-wrap gap-4">
                        {mod.fecha && <span className="text-muted-foreground">Fecha: {mod.fecha}</span>}
                        {mod.notaria && <span className="text-muted-foreground">Notaría: {mod.notaria}</span>}
                      </div>
                      {mod.descripcion && <p className="mt-1 text-foreground">{mod.descripcion}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attorneys */}
            {extractedData.sociedad.apoderados && extractedData.sociedad.apoderados.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Apoderados</p>
                <div className="space-y-2">
                  {extractedData.sociedad.apoderados.map((apod, idx) => (
                    <div key={idx} className="rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{apod.nombre}</p>
                        {apod.clase && <Badge variant="outline" className="text-xs">{apod.clase}</Badge>}
                      </div>
                      {apod.facultades && apod.facultades.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {apod.facultades.map((fac, fidx) => (
                            <Badge key={fidx} variant="secondary" className="text-xs">{fac}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to act */}
            {extractedData.sociedad.formaActuar && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">Forma de Actuar</p>
                <p className="mt-1 text-sm text-muted-foreground">{extractedData.sociedad.formaActuar}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Power of Attorney */}
      {extractedData.poder && (
        <CollapsibleSection title="Análisis del Poder" icon={Stamp}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {extractedData.poder.mandante && (
                <div>
                  <p className="text-sm text-muted-foreground">Mandante</p>
                  <p className="font-medium text-foreground">{extractedData.poder.mandante}</p>
                </div>
              )}
              {extractedData.poder.mandatario && (
                <div>
                  <p className="text-sm text-muted-foreground">Mandatario</p>
                  <p className="font-medium text-foreground">{extractedData.poder.mandatario}</p>
                </div>
              )}
              {extractedData.poder.fechaOtorgamiento && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Otorgamiento</p>
                  <p className="text-foreground">{extractedData.poder.fechaOtorgamiento}</p>
                </div>
              )}
              {extractedData.poder.vigencia && (
                <div>
                  <p className="text-sm text-muted-foreground">Vigencia</p>
                  <Badge variant={extractedData.poder.vigencia.includes('Vigente') ? 'default' : 'destructive'}>
                    {extractedData.poder.vigencia}
                  </Badge>
                </div>
              )}
            </div>

            {/* Faculties */}
            {extractedData.poder.facultades && extractedData.poder.facultades.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Facultades</p>
                <div className="space-y-2">
                  {extractedData.poder.facultades.map((fac, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <span className="text-foreground">{fac.nombre}</span>
                      <div className="flex items-center gap-2">
                        {fac.presente ? (
                          <Badge variant="default" className="bg-accent">Presente</Badge>
                        ) : (
                          <Badge variant="destructive">Ausente</Badge>
                        )}
                        {fac.observacion && (
                          <span className="text-xs text-muted-foreground">{fac.observacion}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restrictions */}
            {extractedData.poder.restricciones && extractedData.poder.restricciones.length > 0 && (
              <div className="rounded-lg bg-chart-4/10 p-4">
                <p className="mb-2 text-sm font-medium text-chart-4">Restricciones</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
                  {extractedData.poder.restricciones.map((rest, idx) => (
                    <li key={idx}>{rest}</li>
                  ))}
                </ul>
              </div>
            )}
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

      {/* Liens/Encumbrances */}
      {extractedData.gravamenes && extractedData.gravamenes.length > 0 && (
        <CollapsibleSection title="Gravámenes" icon={ShieldAlert} variant="warning">
          <div className="space-y-3">
            {extractedData.gravamenes.map((grav, index) => (
              <div key={index} className="rounded-lg border border-chart-4/20 bg-chart-4/5 p-4">
                <Badge variant="outline" className="mb-2 border-chart-4/30 text-chart-4">
                  {grav.tipo}
                </Badge>
                <p className="text-sm text-foreground">{grav.descripcion}</p>
                {grav.beneficiario && (
                  <p className="mt-1 text-xs text-muted-foreground">Beneficiario: {grav.beneficiario}</p>
                )}
                {grav.inscripcion && (
                  <p className="text-xs text-muted-foreground">Inscripción: {grav.inscripcion}</p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Expropriation */}
      {extractedData.expropiabilidad && (
        <CollapsibleSection title="Expropiabilidad" icon={AlertTriangle}>
          <div className="space-y-3">
            {extractedData.expropiabilidad.serviu && (
              <div className={cn(
                "rounded-lg p-4",
                extractedData.expropiabilidad.serviu.afecta ? "bg-destructive/10" : "bg-accent/10"
              )}>
                <p className="text-sm font-medium text-foreground">SERVIU</p>
                <p className="text-sm text-muted-foreground">
                  {extractedData.expropiabilidad.serviu.afecta ? 'AFECTA a expropiación' : 'NO afecta a expropiación'}
                </p>
                {extractedData.expropiabilidad.serviu.fecha && (
                  <p className="text-xs text-muted-foreground">Certificado: {extractedData.expropiabilidad.serviu.fecha}</p>
                )}
              </div>
            )}
            {extractedData.expropiabilidad.dom && (
              <div className={cn(
                "rounded-lg p-4",
                extractedData.expropiabilidad.dom.afecta ? "bg-destructive/10" : "bg-accent/10"
              )}>
                <p className="text-sm font-medium text-foreground">Dirección de Obras Municipales</p>
                <p className="text-sm text-muted-foreground">
                  {extractedData.expropiabilidad.dom.afecta ? 'AFECTA a expropiación' : 'NO afecta a expropiación'}
                </p>
                {extractedData.expropiabilidad.dom.fecha && (
                  <p className="text-xs text-muted-foreground">Certificado: {extractedData.expropiabilidad.dom.fecha}</p>
                )}
              </div>
            )}
            {extractedData.expropiabilidad.vialidad && (
              <div className={cn(
                "rounded-lg p-4",
                extractedData.expropiabilidad.vialidad.afecta ? "bg-destructive/10" : "bg-accent/10"
              )}>
                <p className="text-sm font-medium text-foreground">Dirección de Vialidad</p>
                <p className="text-sm text-muted-foreground">
                  {extractedData.expropiabilidad.vialidad.afecta ? 'AFECTA a expropiación' : 'NO afecta a expropiación'}
                </p>
                {extractedData.expropiabilidad.vialidad.fecha && (
                  <p className="text-xs text-muted-foreground">Certificado: {extractedData.expropiabilidad.vialidad.fecha}</p>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Property Tax */}
      {extractedData.contribuciones && (
        <CollapsibleSection title="Impuesto Territorial" icon={DollarSign}>
          <div className="grid gap-4 sm:grid-cols-2">
            {extractedData.contribuciones.rol && (
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-mono text-foreground">{extractedData.contribuciones.rol}</p>
              </div>
            )}
            {extractedData.contribuciones.comuna && (
              <div>
                <p className="text-sm text-muted-foreground">Comuna</p>
                <p className="text-foreground">{extractedData.contribuciones.comuna}</p>
              </div>
            )}
            {extractedData.contribuciones.deuda !== undefined && (
              <div className={cn(
                "rounded-lg p-3",
                extractedData.contribuciones.deuda ? "bg-destructive/10" : "bg-accent/10"
              )}>
                <p className="text-sm font-medium text-foreground">Estado de Deuda</p>
                <p className={cn(
                  "text-sm",
                  extractedData.contribuciones.deuda ? "text-destructive" : "text-accent"
                )}>
                  {extractedData.contribuciones.deuda ? 'CON cuotas morosas' : 'SIN cuotas morosas'}
                </p>
              </div>
            )}
            {extractedData.contribuciones.exento !== undefined && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium text-foreground">Exención</p>
                <p className="text-sm text-muted-foreground">
                  {extractedData.contribuciones.exento ? 'EXENTO de pago' : 'AFECTO a pago'}
                </p>
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
                <div className="mb-2 flex items-center gap-2">
                  {clausula.numero && (
                    <Badge variant="outline" className="text-xs">{clausula.numero}</Badge>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {clausula.tipo}
                  </Badge>
                </div>
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
              <div key={index} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{monto.concepto}</span>
                  <span className="font-semibold text-foreground">
                    {monto.moneda} {monto.monto}
                  </span>
                </div>
                {monto.formaPago && (
                  <p className="mt-1 text-xs text-muted-foreground">Forma de pago: {monto.formaPago}</p>
                )}
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
        <CollapsibleSection title="Observaciones" icon={Info} defaultOpen={true}>
          <div className="space-y-2">
            {extractedData.observaciones.map((obs, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-foreground">{obs}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}

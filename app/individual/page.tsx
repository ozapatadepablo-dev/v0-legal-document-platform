'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Building2, Home, Users, FileSearch, ArrowRight } from 'lucide-react'

export default function IndividualPage() {
  const types = [
    { 
      id: 'property', 
      label: 'Dominio Vigente', 
      icon: FileText,
      description: 'Transcripción de inscripciones de dominio vigentes',
      path: '/analysis/property'
    },
    { 
      id: 'buyer', 
      label: 'Estudio Compraventa', 
      icon: Home,
      description: 'Análisis de escrituras de compraventa inmobiliaria',
      path: '/analysis/buyer'
    },
    { 
      id: 'company', 
      label: 'Estudio Sociedades', 
      icon: Building2,
      description: 'Informe de constitución y poderes de sociedades',
      path: '/analysis/company'
    },
    { 
      id: 'powers', 
      label: 'Estudio Poderes', 
      icon: Users,
      description: 'Análisis de poderes y facultades otorgadas',
      path: '/analysis/powers'
    },
    { 
      id: 'extraction', 
      label: 'Extraer Información', 
      icon: FileSearch,
      description: 'Extracción de datos relevantes del documento',
      path: '/analysis/extraction'
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          ← Volver al inicio
        </Link>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              ANÁLISIS INDIVIDUAL
            </h1>
            <p className="text-lg text-muted-foreground">
              Selecciona el tipo de análisis que deseas realizar sobre tu documento legal.
            </p>
          </div>

          {/* Grid de tipos de análisis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {types.map((type) => {
              const Icon = type.icon
              return (
                <Link key={type.id} href={type.path}>
                  <Card className="h-full p-6 hover:border-primary/50 transition-all cursor-pointer group">
                    <div className="space-y-4 h-full flex flex-col">
                      <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-center mb-2">
                          {type.label}
                        </h3>
                        <p className="text-xs text-muted-foreground text-center">
                          {type.description}
                        </p>
                      </div>

                      <div className="flex justify-center pt-2">
                        <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

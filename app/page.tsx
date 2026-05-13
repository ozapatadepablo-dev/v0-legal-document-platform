'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'
import { FileText, Layers } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              MODOS
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Analiza documentos legales chilenos con IA. Selecciona cómo prefieres procesar tus documentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
            {/* Opción 1: Análisis Individual */}
            <Link href="/individual" className="group">
              <Card className="p-8 h-full hover:border-primary/50 transition-all cursor-pointer">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <h2 className="text-2xl font-bold text-foreground">
                      Análisis Individual
                    </h2>
                    <p className="text-muted-foreground">
                      Sube un documento y elige el tipo de análisis específico que deseas realizar.
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 text-left">
                    <p className="text-sm font-semibold text-foreground">Ideal para:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Análisis detallado de un documento</li>
                      <li>✓ Revisiones específicas por tipo</li>
                      <li>✓ Procesamiento independiente</li>
                    </ul>
                  </div>

                  <Button className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                    Ir a Análisis Individual
                  </Button>
                </div>
              </Card>
            </Link>

            {/* Opción 2: Análisis Múltiple */}
            <Link href="/multiple" className="group">
              <Card className="p-8 h-full hover:border-accent/50 transition-all cursor-pointer border-accent/30">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                    <Layers className="h-8 w-8 text-accent" />
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <h2 className="text-2xl font-bold text-foreground">
                      INFORME EETT
                    </h2>
                    <p className="text-muted-foreground">
                      Sube un documento y analízalo con todos los tipos disponibles. Obtén un informe consolidado.
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 text-left">
                    <p className="text-sm font-semibold text-foreground">Ideal para:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Visión completa del documento</li>
                      <li>✓ Análisis desde múltiples perspectivas</li>
                      <li>✓ Informe consolidado en un solo lugar</li>
                    </ul>
                  </div>

                  <Button className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                    Ir a Análisis Múltiple
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

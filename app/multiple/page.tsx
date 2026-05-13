'use client'

import { Header } from '@/components/header'
import { MultipleAnalyzer } from '@/components/multiple-analyzer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function MultiplePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>

            <div className="mx-auto max-w-3xl text-center mb-12">
              <h1 className="text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                INFORME EETT
              </h1>
              <p className="mt-4 text-balance text-lg text-muted-foreground">
                Sube un documento y obten análisis completos desde todas las perspectivas. Descarga un informe consolidado con toda la información.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-2xl">
              <MultipleAnalyzer />
            </div>
          </div>
        </section>

        <footer className="border-t border-border bg-card py-8">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
            <p>
              Lexoz — Plataforma de análisis de documentos Legales
            </p>
            <p className="mt-2">
              Los análisis son orientativos y no reemplazan la asesoría legal profesional
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

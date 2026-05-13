'use client'

import { Header } from '@/components/header'
import { DocumentAnalyzer } from '@/components/document-analyzer'
import { FeaturesSection } from '@/components/features-section'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function IndividualPage() {
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
                ANALISIS INDIVIDUAL
              </h1>
              <p className="mt-4 text-balance text-lg text-muted-foreground">
                Sube un documento legal y selecciona el tipo de análisis específico que deseas realizar.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-2xl">
              <DocumentAnalyzer />
            </div>
          </div>
        </section>

        <FeaturesSection />

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

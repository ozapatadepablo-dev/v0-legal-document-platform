import { Header } from '@/components/header'
import { DocumentAnalyzer } from '@/components/document-analyzer'
import { FeaturesSection } from '@/components/features-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Análisis inteligente de documentos jurídicos chilenos
              </h1>
              <p className="mt-6 text-balance text-lg text-muted-foreground">
                Sube tus escrituras, inscripciones de dominio, compraventas o mandatos y obtén un análisis estructurado con información extraída automáticamente usando inteligencia artificial.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-2xl">
              <DocumentAnalyzer />
            </div>
          </div>
        </section>

        <FeaturesSection />

        {/* Footer */}
        <footer className="border-t border-border bg-card py-8">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
            <p>
              LexAnalytica Chile — Plataforma de análisis de documentos jurídicos con IA
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

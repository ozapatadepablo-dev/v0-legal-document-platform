'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Building2 } from 'lucide-react'

export default function CompanyAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setUploadedFile(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('analysisType', 'sociedades')

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      
      setResult(data)
    } catch (err) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Link href="/individual" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          ← Volver a Análisis
        </Link>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Estudio Sociedades
            </h1>
            <p className="text-lg text-muted-foreground">
              Carga documentos de constitución y poderes para análisis societario completo.
            </p>
          </div>

          {!result && (
            <Card
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault()
                handleFile(e.dataTransfer.files[0])
              }}
              onDragOver={(e) => e.preventDefault()}
              className="p-12 text-center cursor-pointer hover:border-primary/50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground mb-2">Arrastra tu PDF aquí</p>
              <p className="text-muted-foreground">o haz clic para seleccionar</p>
            </Card>
          )}

          {loading && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-primary font-semibold">Analizando: {uploadedFile}</p>
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse w-full"></div>
              </div>
              <p className="text-sm text-muted-foreground text-center">Procesando documento...</p>
            </Card>
          )}

          {error && (
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <p className="text-destructive font-semibold mb-3">{error}</p>
              <Button onClick={() => setError(null)}>Intentar de nuevo</Button>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="p-4 border-green-500/50 bg-green-500/5">
                <p className="text-green-600 font-semibold">Análisis completado exitosamente</p>
              </Card>

              <Card className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Informe de Sociedades</h2>
                  <div className="bg-muted p-6 rounded-lg space-y-4">
                    <pre className="text-foreground text-sm whitespace-pre-wrap font-mono">
                      {result.informe}
                    </pre>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setResult(null)
                    setError(null)
                    setUploadedFile(null)
                  }}
                  className="flex-1"
                >
                  Analizar otro documento
                </Button>
                <Button 
                  onClick={() => setResult(null)}
                  variant="outline"
                >
                  Volver
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

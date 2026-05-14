'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileSearch } from 'lucide-react'

export default function ExtractionAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      return
    }

    setError(null)
    setUploadedFiles(prev => [...prev, file])
  }

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      setError('Por favor carga al menos un documento')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      uploadedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('analysisType', 'extraer_info')

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
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Extraer Información
            </h1>
            <p className="text-lg text-muted-foreground">
              Carga documentos legales para extraer información estructurada.
            </p>
          </div>

          {/* Área de carga */}
          {!result && (
            <>
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
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    files.forEach(file => handleFile(file))
                  }}
                  className="hidden"
                />
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <p className="text-xl font-bold text-foreground mb-2">Arrastra tus PDFs aquí</p>
                <p className="text-muted-foreground">o haz clic para seleccionar</p>
              </Card>

              {uploadedFiles.length > 0 && (
                <Card className="p-4 space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-foreground">Documentos cargados ({uploadedFiles.length})</h3>
                    <Button
                      onClick={() => setUploadedFiles([])}
                      variant="outline"
                      size="sm"
                    >
                      Limpiar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <Button
                          onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                          variant="outline"
                          size="sm"
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={uploadedFiles.length === 0 || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Analizando...' : 'Analizar Documentos'}
              </Button>

              {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/5">
                  <p className="text-destructive font-semibold mb-3">{error}</p>
                  <Button onClick={() => setError(null)}>Intentar de nuevo</Button>
                </Card>
              )}

              {loading && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-primary font-semibold">Analizando {uploadedFiles.length} documento(s)...</p>
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Procesando documento...</p>
                </Card>
              )}
            </>
          )}

          {/* Progreso */}
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

          {/* Error */}
          {error && (
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <p className="text-destructive font-semibold mb-3">{error}</p>
              <Button onClick={() => setError(null)}>Intentar de nuevo</Button>
            </Card>
          )}

          {/* Resultado */}
          {result && (
            <div className="space-y-6">
              <Card className="p-4 border-green-500/50 bg-green-500/5">
                <p className="text-green-600 font-semibold">Análisis completado exitosamente</p>
              </Card>

              <Card className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Información Extraída</h2>
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
                    setUploadedFiles([])
                  }}
                  className="flex-1"
                >
                  Analizar otros documentos
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

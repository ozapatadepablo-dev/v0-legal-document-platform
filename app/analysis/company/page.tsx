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
  const [uploadedFiles, setUploadedFiles] = useState({})
  const fileInputRefs = useRef({})

  const documentTypes = [
    { id: 'constitucion', label: 'Constitución' },
    { id: 'extracto', label: 'Extracto' },
    { id: 'publicacion', label: 'Publicación' },
    { id: 'inscripcion', label: 'Inscripción de Constitución' },
    { id: 'modificaciones', label: 'Modificaciones' },
    { id: 'poderes', label: 'Poderes' },
    { id: 'otros', label: 'Otros' },
  ]

  const handleFile = (file, docTypeId) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      return
    }

    setError(null)
    setUploadedFiles(prev => ({
      ...prev,
      [docTypeId]: [...(prev[docTypeId] || []), { file, name: file.name }]
    }))
  }

  const handleRemoveFile = (docTypeId, idx) => {
    setUploadedFiles(prev => ({
      ...prev,
      [docTypeId]: prev[docTypeId].filter((_, i) => i !== idx)
    }))
  }

  const getTotalFiles = () => {
    return Object.values(uploadedFiles).reduce((sum, files) => sum + files.length, 0)
  }

  const handleAnalyze = async () => {
    if (getTotalFiles() === 0) {
      setError('Por favor carga al menos un documento')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      Object.entries(uploadedFiles).forEach(([docType, files]) => {
        files.forEach(({ file }) => {
          formData.append('files', file)
        })
      })
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

          {/* Grid de tipos de documentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {documentTypes.map((docType) => {
              const files = uploadedFiles[docType.id] || []
              return (
                <Card key={docType.id} className="p-4 flex flex-col h-full">
                  {/* Título */}
                  <h3 className="font-semibold text-foreground mb-3">{docType.label}</h3>

                  {/* Área de carga */}
                  <div
                    onClick={() => fileInputRefs.current[docType.id]?.click()}
                    onDrop={(e) => {
                      e.preventDefault()
                      handleFile(e.dataTransfer.files[0], docType.id)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-all mb-3 flex-1 flex flex-col justify-center"
                  >
                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current[docType.id] = el
                      }}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFile(e.target.files?.[0], docType.id)}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium text-foreground">Agregar</p>
                  </div>

                  {/* Lista de archivos agregados */}
                  {files.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(docType.id, idx)}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Resumen y botones */}
          {!result && (
            <>
              {getTotalFiles() > 0 && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <p className="text-sm text-foreground font-medium">
                    Total de documentos agregados: <span className="text-primary font-bold">{getTotalFiles()}</span>
                  </p>
                </Card>
              )}
              {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/5">
                  <p className="text-destructive font-semibold mb-3">{error}</p>
                  <Button onClick={() => setError(null)} size="sm">Intentar de nuevo</Button>
                </Card>
              )}

              {loading && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-primary font-semibold">Analizando {getTotalFiles()} documento(s)...</p>
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse w-full"></div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Procesando documentos...</p>
                </Card>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={getTotalFiles() === 0 || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Analizando...' : 'Analizar Documentos'}
              </Button>
            </>
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
                    setUploadedFiles({})
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

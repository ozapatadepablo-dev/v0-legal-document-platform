'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Building2, Home, Users, FileSearch, Upload } from 'lucide-react'

export default function IndividualPage() {
  const [analysisType, setAnalysisType] = useState('property')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const types = [
    { id: 'property', label: 'Dominio Vigente', icon: FileText },
    { id: 'buyer', label: 'Estudio Compraventa', icon: Home },
    { id: 'company', label: 'Estudio Sociedades', icon: Building2 },
    { id: 'powers', label: 'Estudio Poderes', icon: Users },
    { id: 'extraction', label: 'Extraer Información', icon: FileSearch },
  ]

  const handleFile = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('analysisType', analysisType)

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
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          ← Volver al inicio
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              ANÁLISIS INDIVIDUAL
            </h1>
            <p className="text-lg text-muted-foreground">
              Sube un documento legal y selecciona el tipo de análisis específico que deseas realizar.
            </p>
          </div>

          {/* Botones de tipo de análisis */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Tipo de Análisis</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {types.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setAnalysisType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      analysisType === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={loading}
                  >
                    <div className="flex justify-center mb-2">
                      <Icon className={`h-6 w-6 ${analysisType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className={`text-sm font-semibold ${analysisType === type.id ? 'text-primary' : 'text-foreground'}`}>
                      {type.label}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Área de carga */}
          <Card
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault()
              const files = Array.from(e.dataTransfer.files)
              files.forEach(file => handleFile(file))
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
            <p className="text-xl font-bold text-foreground mb-2">Arrastra tus PDF aquí</p>
            <p className="text-muted-foreground">o haz clic para seleccionar</p>
          </Card>

          {/* Estados */}
          {loading && (
            <Card className="p-4 border-primary/50 bg-primary/5">
              <p className="text-primary font-semibold">Analizando documento...</p>
            </Card>
          )}

          {error && (
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <p className="text-destructive font-semibold">Error: {error}</p>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="p-4 border-green-500/50 bg-green-500/5">
                <p className="text-green-500 font-semibold">Análisis completado</p>
              </Card>
              
              <Button onClick={() => setResult(null)}>
                Nuevo análisis
              </Button>

              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-foreground font-bold mb-2">Informe</h3>
                  <pre className="bg-muted p-4 rounded text-foreground text-sm max-h-96 overflow-auto whitespace-pre-wrap">
                    {result.informe}
                  </pre>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

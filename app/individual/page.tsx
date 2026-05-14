'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

export default function IndividualAnalysisPage() {
  const [analysisType, setAnalysisType] = useState('auto')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analysisTypes = [
    { id: 'auto', label: 'Detección Automática', desc: 'El sistema detecta...' },
    { id: 'property', label: 'Dominio Vigente', desc: 'Transcripción de...' },
    { id: 'buyer', label: 'Estudio Compraventa', desc: 'Análisis de escrituras de...' },
    { id: 'company', label: 'Estudio Sociedades', desc: 'Informe de SA, SpA...' },
    { id: 'powers', label: 'Estudio Poderes', desc: 'Análisis de poderes y...' },
    { id: 'extraction', label: 'Extraer Información', desc: 'Extracción de datos de...' },
  ]

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      return
    }
    processFile(file)
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('analysisType', analysisType)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar el documento')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          ← Volver al inicio
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ANALISIS INDIVIDUAL
          </h1>
          <p className="text-lg text-gray-400">
            Sube un documento legal y selecciona el tipo de análisis específico que deseas realizar.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Tipo de Análisis</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {analysisTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setAnalysisType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  analysisType === type.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-slate-700/50 hover:border-gray-500'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={isProcessing}
              >
                <div className="font-semibold text-white text-sm">{type.label}</div>
                <div className="text-xs text-gray-400 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-500 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-slate-700/30 transition-all mb-8"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="text-5xl mb-4">📤</div>
          <p className="text-xl font-bold text-white mb-2">Arrastra tu documento PDF aquí</p>
          <p className="text-gray-400">o haz clic para seleccionar un archivo</p>
          <p className="text-sm text-gray-500 mt-4">PDF hasta 100MB</p>
        </div>

        {isProcessing && (
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-300 font-semibold">Analizando documento...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-300 font-semibold">Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
              <p className="text-green-300 font-semibold">✓ Análisis completado exitosamente</p>
            </div>

            <button
              onClick={() => {
                setResult(null)
                setError(null)
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Analizar otro documento
            </button>

            <div className="bg-slate-700/50 border border-gray-600 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-white font-bold mb-2">Resumen</h3>
                <p className="text-gray-300">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-2">Informe</h3>
                <pre className="bg-slate-900 p-4 rounded text-gray-300 text-sm max-h-96 overflow-auto whitespace-pre-wrap">
                  {result.informe}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Tipo de Documento</p>
                  <p className="text-white font-semibold">{result.documentType}</p>
                </div>
                <div>
                  <p className="text-gray-400">Confianza</p>
                  <p className="text-white font-semibold">{(result.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

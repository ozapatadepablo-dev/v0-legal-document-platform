'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Upload } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'
import type { AnalysisType } from '@/lib/legal-prompts'

const ANALYSIS_TYPES: Array<{ id: AnalysisType; label: string; description: string }> = [
  { id: 'auto', label: 'Detección Automática', description: 'El sistema detecta...' },
  { id: 'property', label: 'Dominio Vigente', description: 'Transcripción de...' },
  { id: 'buyer', label: 'Estudio Compraventa', description: 'Análisis de escrituras de...' },
  { id: 'company', label: 'Estudio Sociedades', description: 'Informe de SA, SpA...' },
  { id: 'powers', label: 'Estudio Poderes', description: 'Análisis de poderes y...' },
  { id: 'extraction', label: 'Extraer Información', description: 'Extracción de datos de...' },
]

export function DocumentAnalyzer() {
  const [selectedType, setSelectedType] = useState<AnalysisType>('auto')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
      handleAnalyze(selectedFile)
    } else {
      setError('Solo se aceptan archivos PDF')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile)
      setError(null)
      handleAnalyze(droppedFile)
    } else {
      setError('Solo se aceptan archivos PDF')
    }
  }

  const handleAnalyze = async (analyzeFile: File) => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', analyzeFile)
      formData.append('analysisType', selectedType)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-8">
      {/* Selector de tipo */}
      <div>
        <h3 className="mb-4 font-semibold">Tipo de Análisis</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {ANALYSIS_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id)
                setResult(null)
              }}
              disabled={loading}
              className={`rounded-lg border-2 p-3 text-center transition-all ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              } ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="text-sm font-medium">{type.label}</div>
              <div className="text-xs text-gray-500">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-all hover:border-blue-400"
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={loading}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer block">
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="font-medium">Arrastra tu documento PDF aquí</p>
          <p className="text-sm text-gray-500">o haz clic para seleccionar un archivo</p>
        </label>
        {file && <p className="mt-2 text-sm text-green-600">✓ {file.name}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span>Analizando documento...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-green-700">
            <strong>✓ Análisis completado</strong>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Nuevo análisis
            </Button>
          </div>

          <div className="space-y-4 rounded-lg bg-gray-50 p-6">
            <h4 className="font-semibold">Resumen</h4>
            <p className="text-sm text-gray-700">{result.summary}</p>

            <h4 className="mt-4 font-semibold">Informe</h4>
            <pre className="max-h-96 overflow-auto rounded bg-white p-4 text-sm whitespace-pre-wrap">
              {result.informe}
            </pre>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Tipo de Documento:</strong> {result.documentType}
              </p>
              <p>
                <strong>Confianza:</strong> {(result.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

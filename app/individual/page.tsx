'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

export default function IndividualPage() {
  const [analysisType, setAnalysisType] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const types = [
    { id: 'auto', label: 'Detección Automática', icon: '🔍' },
    { id: 'property', label: 'Dominio Vigente', icon: '📋' },
    { id: 'buyer', label: 'Estudio Compraventa', icon: '🏠' },
    { id: 'company', label: 'Estudio Sociedades', icon: '🏢' },
    { id: 'powers', label: 'Estudio Poderes', icon: '👤' },
    { id: 'extraction', label: 'Extraer Información', icon: '📄' },
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          ← Volver al inicio
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-3">ANÁLISIS INDIVIDUAL</h1>
            <p className="text-gray-400 text-lg">Sube un documento legal y selecciona el tipo de análisis</p>
          </div>

          {/* Botones de tipo de análisis */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Tipo de Análisis</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setAnalysisType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    analysisType === type.id
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-slate-700 text-gray-300 hover:border-blue-400'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={loading}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-semibold">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Área de carga */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault()
              handleFile(e.dataTransfer.files[0])
            }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-500 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-slate-700/50 transition-all mb-8"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="text-6xl mb-4">📤</div>
            <p className="text-xl font-bold text-white mb-2">Arrastra tu PDF aquí</p>
            <p className="text-gray-400">o haz clic para seleccionar</p>
          </div>

          {/* Estados */}
          {loading && (
            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-8">
              <p className="text-blue-300 font-semibold">Analizando documento...</p>
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
                <p className="text-green-300 font-semibold">✓ Análisis completado</p>
              </div>
              
              <button
                onClick={() => setResult(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Nuevo análisis
              </button>

              <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-white font-bold mb-2">Informe</h3>
                  <pre className="bg-slate-900 p-4 rounded text-gray-300 text-sm max-h-96 overflow-auto whitespace-pre-wrap">
                    {result.informe}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

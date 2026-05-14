'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

export default function IndividualPage() {
  const [type, setType] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const types = [
    { id: 'auto', name: 'Detección Automática', desc: 'El sistema detecta...' },
    { id: 'property', name: 'Dominio Vigente', desc: 'Transcripción de...' },
    { id: 'buyer', name: 'Estudio Compraventa', desc: 'Análisis de escrituras...' },
    { id: 'company', name: 'Estudio Sociedades', desc: 'Informe de SA, SpA...' },
    { id: 'powers', name: 'Estudio Poderes', desc: 'Análisis de poderes...' },
    { id: 'extraction', name: 'Extraer Información', desc: 'Extracción de datos...' },
  ]

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Solo PDF')
      return
    }

    setLoading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('analysisType', type)

      const res = await fetch('/api/analyze', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-block text-blue-400 hover:text-blue-300 mb-8">
          ← Volver
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">ANALISIS INDIVIDUAL</h1>
          <p className="text-gray-400">Sube un documento legal y selecciona el tipo de análisis</p>
        </div>

        {/* Tipos */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Tipo de Análisis</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`p-4 rounded-xl border-2 text-sm transition-all ${
                  type === t.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-slate-700/50 hover:border-gray-500'
                } ${loading ? 'opacity-50' : ''}`}
                disabled={loading}
              >
                <div className="font-bold text-white">{t.name}</div>
                <div className="text-xs text-gray-400">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files?.[0]
            if (f) handleFile(f)
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-500 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 mb-8 transition-all"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
            className="hidden"
          />
          <div className="text-5xl mb-4">📄</div>
          <p className="text-xl font-bold text-white mb-2">Arrastra tu PDF aquí</p>
          <p className="text-gray-400">o haz clic para seleccionar</p>
        </div>

        {loading && <div className="bg-blue-500/20 border border-blue-500 rounded p-4 text-blue-300 mb-8">Analizando...</div>}
        {error && <div className="bg-red-500/20 border border-red-500 rounded p-4 text-red-300 mb-8">{error}</div>}

        {result && (
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-500 rounded p-4 text-green-300">Análisis completado</div>
            <button
              onClick={() => setResult(null)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
            >
              Nuevo análisis
            </button>
            <div className="bg-slate-700/50 border border-gray-600 rounded p-6 space-y-4">
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
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

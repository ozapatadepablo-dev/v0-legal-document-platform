'use client'

import { useState } from 'react'

export function DocumentAnalyzer() {
  const [selectedType, setSelectedType] = useState('auto')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState<string | null>(null)

  const types = [
    { id: 'auto', label: 'Detección Automática', desc: 'El sistema detecta' },
    { id: 'property', label: 'Dominio Vigente', desc: 'Transcripción de' },
    { id: 'buyer', label: 'Estudio Compraventa', desc: 'Análisis de escrituras' },
    { id: 'company', label: 'Estudio Sociedades', desc: 'Informe de SA, SpA' },
    { id: 'powers', label: 'Estudio Poderes', desc: 'Análisis de poderes' },
    { id: 'extraction', label: 'Extraer Información', desc: 'Extracción de datos' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setError(null)
      handleAnalyze(f)
    } else if (f) {
      setError('Solo se aceptan PDF')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setError(null)
      handleAnalyze(f)
    } else if (f) {
      setError('Solo se aceptan PDF')
    }
  }

  const handleAnalyze = async (f: File) => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('analysisType', selectedType)

      const res = await fetch('/api/analyze', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error')

      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
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
      <div>
        <h3 className="mb-4 font-bold text-lg">Tipo de Análisis</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`p-3 rounded-lg border-2 text-center text-sm ${
                selectedType === t.id
                  ? 'border-blue-500 bg-blue-100 text-blue-900'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
              disabled={loading}
            >
              <div className="font-semibold">{t.label}</div>
              <div className="text-xs">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center hover:border-blue-400"
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          id="pdf-input"
        />
        <label htmlFor="pdf-input" className="cursor-pointer block">
          <div className="text-4xl mb-2">📄</div>
          <p className="font-bold">Arrastra tu PDF aquí</p>
          <p className="text-sm text-gray-600">o haz clic para seleccionar</p>
        </label>
        {file && <p className="mt-2 text-green-600">✓ {file.name}</p>}
      </div>

      {loading && <div className="bg-blue-100 p-4 rounded text-blue-900">⏳ Analizando...</div>}
      {error && <div className="bg-red-100 p-4 rounded text-red-900">❌ {error}</div>}

      {result && (
        <div className="space-y-4 bg-green-50 p-6 rounded-lg">
          <p className="text-green-900 font-bold">✓ Análisis completado</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Nuevo análisis
          </button>
          <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-auto bg-white p-4 rounded">
            {result.informe}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'

export function DocumentAnalyzer() {
  const [selectedType, setSelectedType] = useState('property')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const types = [
    { id: 'property', label: 'Dominio Vigente' },
    { id: 'buyer', label: 'Estudio Compraventa' },
    { id: 'company', label: 'Estudio Sociedades' },
    { id: 'powers', label: 'Estudio Poderes' },
    { id: 'extraction', label: 'Extraer Información' },
  ]

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('analysisType', selectedType)

      const res = await fetch('/api/analyze', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al analizar')
        return
      }

      setResult(data)
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 py-8">
      {/* Selector de tipo */}
      <div>
        <h3 className="text-lg font-bold mb-4">Tipo de Análisis</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                console.log('[v0] Button clicked:', t.id)
                setSelectedType(t.id)
              }}
              className={`p-4 rounded border-2 font-bold transition-all ${
                selectedType === t.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault()
          const f = e.dataTransfer.files?.[0]
          if (f) processFile(f)
        }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-400 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
      >
        <div className="text-5xl mb-3">📄</div>
        <p className="text-lg font-bold">Arrastra tu PDF aquí</p>
        <p className="text-gray-600">o haz clic para seleccionar</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) processFile(f)
          }}
          className="hidden"
        />
      </div>

      {loading && <div className="bg-blue-100 p-4 rounded text-blue-900 font-bold">Analizando...</div>}
      {error && <div className="bg-red-100 p-4 rounded text-red-900 font-bold">{error}</div>}

      {result && (
        <div className="bg-green-50 p-6 rounded-lg space-y-4">
          <p className="text-green-900 font-bold">Análisis completado</p>
          <button
            onClick={() => {
              setResult(null)
              setError('')
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600"
          >
            Nuevo análisis
          </button>
          <div className="bg-white p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-auto">
            {result.informe}
          </div>
        </div>
      )}
    </div>
  )
}

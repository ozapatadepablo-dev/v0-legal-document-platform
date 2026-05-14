'use client'

import { useState, useRef } from 'react'

export default function IndividualPage() {
  const [selectedType, setSelectedType] = useState('property')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const types = [
    { id: 'property', label: 'Dominio Vigente' },
    { id: 'buyer', label: 'Estudio Compraventa' },
    { id: 'company', label: 'Estudio Sociedades' },
    { id: 'powers', label: 'Estudio Poderes' },
    { id: 'extraction', label: 'Extraer Información' },
  ]

  const processFile = async (file) => {
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
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '40px' }}>
      <button
        onClick={() => {
          console.log('[v0] Navigate home')
          window.location.href = '/'
        }}
        style={{ marginBottom: '30px', padding: '8px 16px', backgroundColor: '#0066ff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
      >
        ← Volver
      </button>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
          ANALISIS INDIVIDUAL
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', color: '#aaa' }}>
          Sube un documento legal y selecciona el tipo de análisis específico que deseas realizar.
        </p>

        {/* Selector de tipo */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Tipo de Análisis</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  console.log('[v0] Type selected:', t.id)
                  setSelectedType(t.id)
                }}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: selectedType === t.id ? '2px solid #0066ff' : '2px solid #333',
                  backgroundColor: selectedType === t.id ? '#003399' : '#1a1a1a',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload area */}
        <div
          onClick={() => {
            console.log('[v0] Upload area clicked')
            inputRef.current?.click()
          }}
          onDrop={(e) => {
            e.preventDefault()
            console.log('[v0] File dropped')
            const f = e.dataTransfer.files?.[0]
            if (f) processFile(f)
          }}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: '2px dashed #666',
            borderRadius: '8px',
            padding: '48px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '40px',
            backgroundColor: '#111',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0066ff'
            e.currentTarget.style.backgroundColor = '#1a2633'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#666'
            e.currentTarget.style.backgroundColor = '#111'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Arrastra tu PDF aquí</p>
          <p style={{ fontSize: '14px', color: '#999' }}>o haz clic para seleccionar</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                console.log('[v0] File selected:', f.name)
                processFile(f)
              }
            }}
            style={{ display: 'none' }}
          />
        </div>

        {loading && (
          <div style={{ backgroundColor: '#003300', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
            Analizando documento...
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#330000', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', color: '#ff6666' }}>
            Error: {error}
          </div>
        )}

        {result && (
          <div style={{ backgroundColor: '#001a00', padding: '24px', borderRadius: '8px', space: '16px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '16px', color: '#66ff66' }}>Análisis completado</p>
            <button
              onClick={() => {
                setResult(null)
                setError('')
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0066ff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}
            >
              Nuevo análisis
            </button>
            <div style={{
              backgroundColor: '#0a0a0a',
              padding: '16px',
              borderRadius: '4px',
              fontSize: '13px',
              maxHeight: '400px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {result.informe}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

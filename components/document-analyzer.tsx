'use client'

import { useState } from 'react'

export function DocumentAnalyzer() {
  const [tipo, setTipo] = useState('property')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Tipo de Análisis
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => {
            console.log('Clicked property')
            setTipo('property')
          }}
          style={{
            padding: '1rem',
            border: tipo === 'property' ? '3px solid blue' : '2px solid gray',
            backgroundColor: tipo === 'property' ? '#e3f2fd' : 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          Dominio Vigente
        </button>

        <button
          onClick={() => {
            console.log('Clicked buyer')
            setTipo('buyer')
          }}
          style={{
            padding: '1rem',
            border: tipo === 'buyer' ? '3px solid blue' : '2px solid gray',
            backgroundColor: tipo === 'buyer' ? '#e3f2fd' : 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          Estudio Compraventa
        </button>

        <button
          onClick={() => {
            console.log('Clicked company')
            setTipo('company')
          }}
          style={{
            padding: '1rem',
            border: tipo === 'company' ? '3px solid blue' : '2px solid gray',
            backgroundColor: tipo === 'company' ? '#e3f2fd' : 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          Estudio Sociedades
        </button>

        <button
          onClick={() => {
            console.log('Clicked powers')
            setTipo('powers')
          }}
          style={{
            padding: '1rem',
            border: tipo === 'powers' ? '3px solid blue' : '2px solid gray',
            backgroundColor: tipo === 'powers' ? '#e3f2fd' : 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          Estudio Poderes
        </button>

        <button
          onClick={() => {
            console.log('Clicked extraction')
            setTipo('extraction')
          }}
          style={{
            padding: '1rem',
            border: tipo === 'extraction' ? '3px solid blue' : '2px solid gray',
            backgroundColor: tipo === 'extraction' ? '#e3f2fd' : 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          Extraer Información
        </button>
      </div>

      <div
        style={{
          border: '2px dashed gray',
          borderRadius: '0.5rem',
          padding: '3rem',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Arrastra tu PDF aquí</p>
        <p style={{ color: '#666' }}>o haz clic para seleccionar</p>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              console.log('File selected:', file.name, 'Type:', tipo)
              setCargando(true)
              // Simulación de análisis
              setTimeout(() => {
                setResultado({ informe: 'Análisis completado para: ' + file.name })
                setCargando(false)
              }, 2000)
            }
          }}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
          Click aquí o arrastra archivo
        </label>
      </div>

      {cargando && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '0.5rem' }}>
          Analizando...
        </div>
      )}

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#ffebee', borderRadius: '0.5rem', color: '#c62828' }}>
          {error}
        </div>
      )}

      {resultado && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '0.5rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>✓ Análisis completado</p>
          <pre style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', maxHeight: '400px' }}>
            {resultado.informe}
          </pre>
          <button
            onClick={() => setResultado(null)}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Nuevo análisis
          </button>
        </div>
      )}
    </div>
  )
}

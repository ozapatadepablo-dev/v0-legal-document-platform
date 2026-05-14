'use client'

import { DocumentAnalyzer } from '@/components/document-analyzer'

export default function IndividualPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '40px' }}>
      <button
        onClick={() => window.location.href = '/'}
        style={{ marginBottom: '30px', padding: '8px 16px', backgroundColor: '#0066ff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
      >
        ← Volver
      </button>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
          ANALISIS INDIVIDUAL
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', color: '#aaa' }}>
          Sube un documento legal y selecciona el tipo de análisis específico que deseas realizar.
        </p>

        <DocumentAnalyzer />
      </div>
    </div>
  )
}

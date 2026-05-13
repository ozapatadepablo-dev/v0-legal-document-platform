'use client'

import { useState, useCallback } from 'react'
import { UploadZone } from './upload-zone'
import { ProcessingStatus } from './processing-status'
import { AnalysisResults } from './analysis-results'
import { AnalysisTypeSelector } from './analysis-type-selector'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, FileText } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'
import type { AnalysisType } from '@/lib/legal-prompts'

type ProcessingStage = 'uploading' | 'extracting' | 'analyzing' | 'completed' | 'error'

export function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<AnalysisType>('auto')
  const [stage, setStage] = useState<ProcessingStage | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeDocument = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setStage('uploading')
    setError(null)
    setResult(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setStage('extracting')
      
      await new Promise(resolve => setTimeout(resolve, 800))
      setStage('analyzing')

      const formData = new FormData()
      formData.append('file', selectedFile)
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
      setStage('completed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStage('error')
    }
  }, [analysisType])

  const handleClear = useCallback(() => {
    setFile(null)
    setStage(null)
    setResult(null)
    setError(null)
  }, [])

  const handleExportJSON = useCallback(() => {
    if (!result) return
    
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analisis-${file?.name.replace('.pdf', '')}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [result, file])

  const handleExportInforme = useCallback(() => {
    if (!result?.informe) return
    
    const blob = new Blob([result.informe], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `informe-${file?.name.replace('.pdf', '')}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [result, file])

  const isProcessing = stage !== null && stage !== 'completed' && stage !== 'error'

  console.log('[v0] DocumentAnalyzer - isProcessing:', isProcessing, 'stage:', stage, 'analysisType:', analysisType)

  return (
    <div className="space-y-8">
      <AnalysisTypeSelector
        selected={analysisType}
        onSelect={setAnalysisType}
        disabled={isProcessing}
      />

      <UploadZone
        onFileSelect={analyzeDocument}
        isProcessing={isProcessing}
        currentFile={file}
        onClear={handleClear}
      />

      {stage && stage !== 'completed' && (
        <ProcessingStatus stage={stage} error={error} />
      )}

      {stage === 'completed' && result && (
        <div className="space-y-6">
          <ProcessingStatus stage={stage} />
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleClear} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Analizar otro documento
            </Button>
            <Button onClick={handleExportInforme} variant="default">
              <FileText className="mr-2 h-4 w-4" />
              Exportar Informe
            </Button>
            <Button onClick={handleExportJSON} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON
            </Button>
          </div>

          <AnalysisResults result={result} />
        </div>
      )}

      {stage === 'error' && (
        <div className="flex justify-center">
          <Button onClick={handleClear} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        </div>
      )}
    </div>
  )
}

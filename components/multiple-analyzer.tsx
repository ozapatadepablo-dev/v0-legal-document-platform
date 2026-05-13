'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UploadZone } from './upload-zone'
import { ProcessingStatus } from './processing-status'
import { AnalysisResults } from './analysis-results'
import { type AnalysisType } from '@/lib/types'
import { Download } from 'lucide-react'

type MultipleAnalysisResult = {
  type: AnalysisType
  result: any
  loading: boolean
  error?: string
}

export function MultipleAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<MultipleAnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analysisTypes: AnalysisType[] = [
    'auto',
    'dominio',
    'compraventa',
    'sociedades',
    'poderes',
    'certificados'
  ]

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setResults([])
  }

  const startMultipleAnalysis = async () => {
    if (!file) return

    setIsAnalyzing(true)
    
    // Inicializar todos los análisis como cargando
    const initialResults: MultipleAnalysisResult[] = analysisTypes.map(type => ({
      type,
      result: null,
      loading: true,
    }))
    setResults(initialResults)

    // Procesar cada tipo de análisis
    for (let i = 0; i < analysisTypes.length; i++) {
      const analysisType = analysisTypes[i]
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('analysisType', analysisType)

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }

        const data = await response.json()

        // Actualizar este resultado
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, result: data, loading: false } : r
        ))
      } catch (error) {
        console.error(`Error in ${analysisType} analysis:`, error)
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            loading: false, 
            error: error instanceof Error ? error.message : 'Error desconocido' 
          } : r
        ))
      }
    }

    setIsAnalyzing(false)
  }

  const downloadConsolidatedReport = () => {
    const consolidatedData = {
      fileName: file?.name,
      timestamp: new Date().toISOString(),
      analyses: results.map(r => ({
        type: r.type,
        data: r.result,
      })),
    }

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(consolidatedData, null, 2)))
    element.setAttribute('download', `informe-consolidado-${Date.now()}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <UploadZone onFileSelect={handleFileSelect} />
      ) : (
        <div className="space-y-6">
          {/* File info */}
          <Card className="p-4 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documento seleccionado</p>
                <p className="font-semibold text-foreground">{file.name}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFile(null)
                  setResults([])
                }}
              >
                Cambiar archivo
              </Button>
            </div>
          </Card>

          {/* Analysis types grid */}
          {results.length === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {analysisTypes.map(type => (
                  <Card key={type} className="p-4">
                    <p className="font-medium text-foreground capitalize">
                      {type === 'auto' ? 'Detección Automática' :
                       type === 'dominio' ? 'Dominio Vigente' :
                       type === 'compraventa' ? 'Compraventa' :
                       type === 'sociedades' ? 'Sociedades' :
                       type === 'poderes' ? 'Poderes' : 'Certificados'}
                    </p>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={startMultipleAnalysis}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? 'Analizando...' : 'Iniciar Análisis Múltiple'}
              </Button>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-6">
              {/* Download button */}
              {!results.some(r => r.loading) && (
                <Button 
                  onClick={downloadConsolidatedReport}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar Informe Consolidado
                </Button>
              )}

              {/* Individual results */}
              <div className="space-y-4">
                {results.map((analysisResult, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="p-4 border-b border-border bg-card/50">
                      <h3 className="font-semibold text-foreground capitalize">
                        {analysisResult.type === 'auto' ? 'Detección Automática' :
                         analysisResult.type === 'dominio' ? 'Dominio Vigente' :
                         analysisResult.type === 'compraventa' ? 'Compraventa' :
                         analysisResult.type === 'sociedades' ? 'Sociedades' :
                         analysisResult.type === 'poderes' ? 'Poderes' : 'Certificados'}
                      </h3>
                    </div>
                    
                    <div className="p-4">
                      {analysisResult.loading ? (
                        <ProcessingStatus />
                      ) : analysisResult.error ? (
                        <div className="text-sm text-destructive">
                          Error: {analysisResult.error}
                        </div>
                      ) : analysisResult.result ? (
                        <AnalysisResults analysis={analysisResult.result} />
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

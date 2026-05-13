'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProcessingStatus } from './processing-status'
import { AnalysisResults } from './analysis-results'
import { ANALYSIS_TYPES } from '@/lib/legal-prompts'
import { type AnalysisType } from '@/lib/legal-prompts'
import { Download, Upload, X } from 'lucide-react'

type DocumentAnalysis = {
  type: AnalysisType
  file: File | null
  result: any
  loading: boolean
  error?: string
}

export function MultipleAnalyzer() {
  const [documents, setDocuments] = useState<DocumentAnalysis[]>(
    ANALYSIS_TYPES.filter(t => t.id !== 'auto').map(t => ({
      type: t.id as AnalysisType,
      file: null,
      result: null,
      loading: false,
    }))
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileSelect = (type: AnalysisType, file: File | null) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.type === type
          ? { ...doc, file, result: null, error: undefined, loading: false }
          : doc
      )
    )
  }

  const handleRemoveFile = (type: AnalysisType) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.type === type
          ? { ...doc, file: null, result: null, error: undefined }
          : doc
      )
    )
  }

  const startAnalysis = async () => {
    const filesToAnalyze = documents.filter(d => d.file !== null)
    if (filesToAnalyze.length === 0) return

    setIsAnalyzing(true)

    for (const doc of filesToAnalyze) {
      if (!doc.file) continue

      setDocuments(prev =>
        prev.map(d =>
          d.type === doc.type ? { ...d, loading: true } : d
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', doc.file)
        formData.append('analysisType', doc.type)

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }

        const data = await response.json()

        setDocuments(prev =>
          prev.map(d =>
            d.type === doc.type
              ? { ...d, result: data, loading: false }
              : d
          )
        )
      } catch (error) {
        console.error(`Error in ${doc.type} analysis:`, error)
        setDocuments(prev =>
          prev.map(d =>
            d.type === doc.type
              ? {
                  ...d,
                  loading: false,
                  error: error instanceof Error ? error.message : 'Error desconocido',
                }
              : d
          )
        )
      }
    }

    setIsAnalyzing(false)
  }

  const downloadConsolidatedReport = () => {
    const consolidatedData = {
      timestamp: new Date().toISOString(),
      analyses: documents
        .filter(d => d.result)
        .map(d => ({
          type: d.type,
          fileName: d.file?.name,
          data: d.result,
        })),
    }

    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(consolidatedData, null, 2))
    )
    element.setAttribute(
      'download',
      `informe-eett-${Date.now()}.json`
    )
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const hasResults = documents.some(d => d.result !== null)
  const hasErrors = documents.some(d => d.error)
  const documentsWithFiles = documents.filter(d => d.file !== null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Carga un documento por separado para cada tipo de análisis. Puedes cargar todos los que necesites o solo los específicos.
        </p>
      </div>

      {/* Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(doc => {
          const typeInfo = ANALYSIS_TYPES.find(t => t.id === doc.type)
          if (!typeInfo) return null

          return (
            <Card key={doc.type} className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {typeInfo.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeInfo.description}
                  </p>
                </div>

                {doc.file ? (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Upload className="h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm text-foreground truncate">
                        {doc.file.name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(doc.type)}
                      className="ml-2 p-1 hover:bg-primary/20 rounded transition-colors"
                      disabled={isAnalyzing || doc.loading}
                    >
                      <X className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(doc.type, file)
                      }}
                      disabled={isAnalyzing}
                      className="hidden"
                    />
                    <div className="p-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer text-center">
                      <Upload className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">
                        Hacer clic para cargar PDF
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      {documentsWithFiles.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={startAnalysis}
            disabled={isAnalyzing || documentsWithFiles.length === 0}
            className="flex-1"
            size="lg"
          >
            {isAnalyzing ? 'Analizando...' : `Analizar ${documentsWithFiles.length} ${documentsWithFiles.length === 1 ? 'documento' : 'documentos'}`}
          </Button>

          <Button
            onClick={() => {
              setDocuments(prev =>
                prev.map(d => ({
                  ...d,
                  file: null,
                  result: null,
                  error: undefined,
                  loading: false,
                }))
              )
            }}
            variant="outline"
            disabled={isAnalyzing}
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-4">
          {/* Download Button */}
          {!isAnalyzing && (
            <Button
              onClick={downloadConsolidatedReport}
              variant="outline"
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar Informe EETT Consolidado
            </Button>
          )}

          {/* Individual Results */}
          <div className="space-y-4">
            {documents.map(doc => {
              if (!doc.file) return null

              const typeInfo = ANALYSIS_TYPES.find(t => t.id === doc.type)
              if (!typeInfo) return null

              return (
                <Card key={doc.type} className="overflow-hidden">
                  <div className="p-4 border-b border-border bg-card/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {typeInfo.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.file.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {doc.loading ? (
                      <ProcessingStatus />
                    ) : doc.error ? (
                      <div className="p-4 bg-destructive/10 rounded-lg text-sm text-destructive">
                        {doc.error}
                      </div>
                    ) : doc.result ? (
                      <AnalysisResults analysis={doc.result} />
                    ) : null}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasResults && documentsWithFiles.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Carga documentos en los tipos que necesites analizar para comenzar.
          </p>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  isProcessing: boolean
  currentFile: File | null
  onClear: () => void
}

export function UploadZone({ onFileSelect, isProcessing, currentFile, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    setError(null)
    
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      return false
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setError('El archivo no puede superar los 20MB')
      return false
    }
    
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && validateFile(file)) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      onFileSelect(file)
    }
    e.target.value = ''
  }, [onFileSelect])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (currentFile) {
    return (
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{currentFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(currentFile.size)}</p>
            </div>
          </div>
          {!isProcessing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-foreground">
              Arrastra tu documento PDF aquí
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              o haz clic para seleccionar un archivo
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">Inscripciones</span>
            <span className="rounded-full bg-muted px-3 py-1">Compraventas</span>
            <span className="rounded-full bg-muted px-3 py-1">Mandatos</span>
            <span className="rounded-full bg-muted px-3 py-1">Hipotecas</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            PDF hasta 20MB
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

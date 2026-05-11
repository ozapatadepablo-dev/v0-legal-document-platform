export type DocumentType = 
  | 'inscripcion_dominio'
  | 'compraventa'
  | 'mandato'
  | 'hipoteca'
  | 'prohibicion'
  | 'usufructo'
  | 'servidumbre'
  | 'otro'

export interface DocumentAnalysis {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  documentType?: DocumentType
  extractedData?: ExtractedData
  summary?: string
  error?: string
}

export interface ExtractedData {
  tipoDocumento: string
  fechaDocumento?: string
  notaria?: {
    nombre: string
    ciudad: string
  }
  partes?: {
    rol: string
    nombre: string
    rut?: string
    domicilio?: string
  }[]
  inmueble?: {
    direccion?: string
    comuna?: string
    region?: string
    rolAvaluo?: string
    deslindes?: string
    superficie?: string
    inscripcion?: {
      cbr: string
      fojas: string
      numero: string
      ano: string
    }
  }
  clausulas?: {
    tipo: string
    descripcion: string
  }[]
  montos?: {
    concepto: string
    monto: string
    moneda: string
  }[]
  plazos?: {
    descripcion: string
    fecha?: string
  }[]
  observaciones?: string[]
}

export interface AnalysisResult {
  documentType: DocumentType
  extractedData: ExtractedData
  summary: string
  confidence: number
}

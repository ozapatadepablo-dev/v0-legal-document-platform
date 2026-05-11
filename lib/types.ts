import type { AnalysisType } from './legal-prompts'

export type DocumentType = 
  | 'inscripcion_dominio'
  | 'compraventa'
  | 'mandato'
  | 'hipoteca'
  | 'prohibicion'
  | 'usufructo'
  | 'servidumbre'
  | 'sociedad'
  | 'poder'
  | 'certificado'
  | 'otro'

export interface DocumentAnalysis {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  analysisType: AnalysisType
  documentType?: string
  extractedData?: ExtractedData
  summary?: string
  informe?: string
  confidence?: number
  error?: string
}

export interface ExtractedData {
  tipoDocumento: string
  tipoAnalisis: string
  fechaDocumento?: string
  
  notaria?: {
    nombre: string
    ciudad: string
    repertorio?: string
  }
  
  partes?: {
    rol: string
    nombre: string
    rut?: string
    domicilio?: string
    estadoCivil?: string
    representante?: string
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
  
  sociedad?: {
    razonSocial?: string
    rut?: string
    tipoSociedad?: string
    constitucion?: {
      fecha?: string
      notaria?: string
      repertorio?: string
    }
    publicacion?: {
      diarioOficial?: string
      fecha?: string
    }
    inscripcionComercio?: {
      cbr?: string
      fojas?: string
      numero?: string
      ano?: string
    }
    vigencia?: {
      certificadoFecha?: string
      estado?: string
    }
    modificaciones?: {
      fecha?: string
      descripcion?: string
      notaria?: string
    }[]
    apoderados?: {
      nombre: string
      clase?: string
      facultades?: string[]
    }[]
    formaActuar?: string
  }
  
  poder?: {
    vigencia?: string
    fechaOtorgamiento?: string
    notaria?: string
    mandante?: string
    mandatario?: string
    facultades?: {
      nombre: string
      presente: boolean
      observacion?: string
    }[]
    restricciones?: string[]
  }
  
  gravamenes?: {
    tipo: string
    descripcion: string
    beneficiario?: string
    inscripcion?: string
  }[]
  
  expropiabilidad?: {
    serviu?: {
      fecha?: string
      region?: string
      afecta?: boolean
    }
    dom?: {
      fecha?: string
      comuna?: string
      afecta?: boolean
    }
    vialidad?: {
      fecha?: string
      afecta?: boolean
    }
  }
  
  contribuciones?: {
    rol?: string
    comuna?: string
    deuda?: boolean
    fechaCertificado?: string
    exento?: boolean
  }
  
  clausulas?: {
    numero?: string
    tipo: string
    descripcion: string
  }[]
  
  montos?: {
    concepto: string
    monto: string
    moneda: string
    formaPago?: string
  }[]
  
  plazos?: {
    descripcion: string
    fecha?: string
  }[]
  
  transcripcionLiteral?: string
  
  formaAdquisicion?: {
    tipo?: string
    escritura?: string
    notaria?: string
    fecha?: string
  }
  
  observaciones?: string[]
  alertas?: {
    tipo: 'info' | 'warning' | 'error'
    mensaje: string
  }[]
}

export interface AnalysisResult {
  analysisType: string
  documentType: string
  extractedData: ExtractedData
  summary: string
  informe: string
  confidence: number
}

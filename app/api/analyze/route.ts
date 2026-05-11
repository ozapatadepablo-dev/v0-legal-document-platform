import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getPromptForType, type AnalysisType } from '@/lib/legal-prompts'
import { extractText } from 'unpdf'

// Schema flexible para diferentes tipos de análisis
const extractedDataSchema = z.object({
  tipoDocumento: z.string().describe('Tipo de documento legal identificado'),
  tipoAnalisis: z.string().describe('Tipo de análisis realizado'),
  fechaDocumento: z.string().nullable().describe('Fecha del documento'),
  
  // Información de notaría/CBR
  notaria: z.object({
    nombre: z.string().describe('Nombre del notario'),
    ciudad: z.string().describe('Ciudad de la notaría'),
    repertorio: z.string().nullable().describe('Número de repertorio'),
  }).nullable(),
  
  // Partes involucradas
  partes: z.array(z.object({
    rol: z.string().describe('Rol de la parte'),
    nombre: z.string().describe('Nombre completo o razón social'),
    rut: z.string().nullable().describe('RUT'),
    domicilio: z.string().nullable().describe('Domicilio'),
    estadoCivil: z.string().nullable().describe('Estado civil si aplica'),
    representante: z.string().nullable().describe('Representante legal si es sociedad'),
  })),
  
  // Información del inmueble
  inmueble: z.object({
    direccion: z.string().nullable(),
    comuna: z.string().nullable(),
    region: z.string().nullable(),
    rolAvaluo: z.string().nullable(),
    deslindes: z.string().nullable(),
    superficie: z.string().nullable(),
    inscripcion: z.object({
      cbr: z.string().describe('Conservador de Bienes Raíces'),
      fojas: z.string().describe('Número de fojas'),
      numero: z.string().describe('Número de inscripción'),
      ano: z.string().describe('Año de inscripción'),
    }).nullable(),
  }).nullable(),
  
  // Información societaria (para análisis de sociedades)
  sociedad: z.object({
    razonSocial: z.string().nullable(),
    rut: z.string().nullable(),
    tipoSociedad: z.string().nullable().describe('SA, SpA, Ltda, etc.'),
    constitucion: z.object({
      fecha: z.string().nullable(),
      notaria: z.string().nullable(),
      repertorio: z.string().nullable(),
    }).nullable(),
    publicacion: z.object({
      diarioOficial: z.string().nullable(),
      fecha: z.string().nullable(),
    }).nullable(),
    inscripcionComercio: z.object({
      cbr: z.string().nullable(),
      fojas: z.string().nullable(),
      numero: z.string().nullable(),
      ano: z.string().nullable(),
    }).nullable(),
    vigencia: z.object({
      certificadoFecha: z.string().nullable(),
      estado: z.string().nullable(),
    }).nullable(),
    modificaciones: z.array(z.object({
      fecha: z.string().nullable(),
      descripcion: z.string().nullable(),
      notaria: z.string().nullable(),
    })).nullable(),
    apoderados: z.array(z.object({
      nombre: z.string(),
      clase: z.string().nullable(),
      facultades: z.array(z.string()).nullable(),
    })).nullable(),
    formaActuar: z.string().nullable().describe('Cómo deben actuar los apoderados'),
  }).nullable(),
  
  // Información de poderes/mandatos
  poder: z.object({
    vigencia: z.string().nullable(),
    fechaOtorgamiento: z.string().nullable(),
    notaria: z.string().nullable(),
    mandante: z.string().nullable(),
    mandatario: z.string().nullable(),
    facultades: z.array(z.object({
      nombre: z.string(),
      presente: z.boolean(),
      observacion: z.string().nullable(),
    })).nullable(),
    restricciones: z.array(z.string()).nullable(),
  }).nullable(),
  
  // Información de gravámenes y certificados
  gravamenes: z.array(z.object({
    tipo: z.string().describe('Hipoteca, prohibición, etc.'),
    descripcion: z.string(),
    beneficiario: z.string().nullable(),
    inscripcion: z.string().nullable(),
  })).nullable(),
  
  expropiabilidad: z.object({
    serviu: z.object({
      fecha: z.string().nullable(),
      region: z.string().nullable(),
      afecta: z.boolean().nullable(),
    }).nullable(),
    dom: z.object({
      fecha: z.string().nullable(),
      comuna: z.string().nullable(),
      afecta: z.boolean().nullable(),
    }).nullable(),
    vialidad: z.object({
      fecha: z.string().nullable(),
      afecta: z.boolean().nullable(),
    }).nullable(),
  }).nullable(),
  
  contribuciones: z.object({
    rol: z.string().nullable(),
    comuna: z.string().nullable(),
    deuda: z.boolean().nullable(),
    fechaCertificado: z.string().nullable(),
    exento: z.boolean().nullable(),
  }).nullable(),
  
  // Cláusulas y condiciones
  clausulas: z.array(z.object({
    numero: z.string().nullable(),
    tipo: z.string(),
    descripcion: z.string(),
  })),
  
  // Montos y pagos
  montos: z.array(z.object({
    concepto: z.string(),
    monto: z.string(),
    moneda: z.string(),
    formaPago: z.string().nullable(),
  })),
  
  // Plazos
  plazos: z.array(z.object({
    descripcion: z.string(),
    fecha: z.string().nullable(),
  })),
  
  // Transcripción literal (para dominio vigente)
  transcripcionLiteral: z.string().nullable().describe('Transcripción textual del documento'),
  
  // Forma de adquisición
  formaAdquisicion: z.object({
    tipo: z.string().nullable().describe('Compraventa, herencia, aporte, etc.'),
    escritura: z.string().nullable(),
    notaria: z.string().nullable(),
    fecha: z.string().nullable(),
  }).nullable(),
  
  // Observaciones y alertas
  observaciones: z.array(z.string()),
  alertas: z.array(z.object({
    tipo: z.enum(['info', 'warning', 'error']),
    mensaje: z.string(),
  })),
})

const analysisResultSchema = z.object({
  analysisType: z.string().describe('Tipo de análisis realizado'),
  documentType: z.string().describe('Clasificación del documento'),
  extractedData: extractedDataSchema,
  summary: z.string().describe('Resumen ejecutivo del análisis'),
  informe: z.string().describe('Informe completo formateado según el tipo de análisis'),
  confidence: z.number().min(0).max(1).describe('Nivel de confianza del análisis'),
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const analysisType = (formData.get('analysisType') as AnalysisType) || 'auto'
    
    if (!file) {
      return Response.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    
    // Extract text using unpdf (serverless-friendly)
    const pdfResult = await extractText(new Uint8Array(arrayBuffer))
    
    // Handle both string and array responses from unpdf
    const textContent = Array.isArray(pdfResult.text) 
      ? pdfResult.text.join('\n') 
      : String(pdfResult.text || '')

    if (!textContent || textContent.trim().length < 50) {
      return Response.json({ 
        error: 'No se pudo extraer texto del PDF. Asegúrese de que el documento contenga texto seleccionable.' 
      }, { status: 400 })
    }

    const specificPrompt = getPromptForType(analysisType)
    
    const systemPrompt = `${specificPrompt}

INSTRUCCIONES GENERALES:
1. Analiza el documento completo y extrae TODA la información relevante
2. Sigue el formato de salida estructurado
3. En el campo "informe" genera un informe completo y formateado según el tipo de análisis
4. Si detectas información faltante o problemas, agrégalos en "alertas"
5. Usa el formato de fecha chileno (DD/MM/YYYY)
6. Los RUTs deben estar en formato XX.XXX.XXX-X
7. Si algún campo no está presente, déjalo como null o array vacío
8. El resumen debe ser conciso (máximo 3 párrafos)
9. El informe debe ser completo y seguir la estructura del tipo de análisis seleccionado

IMPORTANTE: Responde siempre en español chileno legal.`

    const userPrompt = analysisType === 'auto' 
      ? `Analiza el siguiente documento legal chileno, identifica su tipo y extrae toda la información relevante:\n\n${textContent.substring(0, 100000)}`
      : `Realiza un análisis de tipo "${analysisType}" sobre el siguiente documento legal chileno:\n\n${textContent.substring(0, 100000)}`

    const { output } = await generateText({
      model: 'google/gemini-2.5-flash-preview-05-20',
      system: systemPrompt,
      prompt: userPrompt,
      output: Output.object({
        schema: analysisResultSchema,
      }),
      maxOutputTokens: 16000,
      temperature: 0.1,
    })

    if (!output) {
      return Response.json({ 
        error: 'No se pudo generar el análisis. Por favor, intente nuevamente.' 
      }, { status: 500 })
    }

    return Response.json(output)
  } catch (error) {
    console.error('Error analyzing document:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Error al procesar el documento' 
    }, { status: 500 })
  }
}

import { generateText, Output } from 'ai'
import { z } from 'zod'

const extractedDataSchema = z.object({
  tipoDocumento: z.string().describe('Tipo de documento legal (inscripción de dominio, compraventa, mandato, hipoteca, etc.)'),
  fechaDocumento: z.string().nullable().describe('Fecha del documento en formato DD/MM/YYYY'),
  notaria: z.object({
    nombre: z.string().describe('Nombre del notario'),
    ciudad: z.string().describe('Ciudad de la notaría'),
  }).nullable().describe('Información de la notaría'),
  partes: z.array(z.object({
    rol: z.string().describe('Rol de la parte (vendedor, comprador, mandante, mandatario, acreedor, deudor, etc.)'),
    nombre: z.string().describe('Nombre completo de la persona o razón social'),
    rut: z.string().nullable().describe('RUT de la persona o empresa'),
    domicilio: z.string().nullable().describe('Domicilio declarado'),
  })).describe('Partes involucradas en el documento'),
  inmueble: z.object({
    direccion: z.string().nullable().describe('Dirección del inmueble'),
    comuna: z.string().nullable().describe('Comuna'),
    region: z.string().nullable().describe('Región'),
    rolAvaluo: z.string().nullable().describe('Rol de avalúo del SII'),
    deslindes: z.string().nullable().describe('Descripción de los deslindes'),
    superficie: z.string().nullable().describe('Superficie del inmueble'),
    inscripcion: z.object({
      cbr: z.string().describe('Conservador de Bienes Raíces'),
      fojas: z.string().describe('Número de fojas'),
      numero: z.string().describe('Número de inscripción'),
      ano: z.string().describe('Año de inscripción'),
    }).nullable().describe('Datos de inscripción en el CBR'),
  }).nullable().describe('Información del inmueble'),
  clausulas: z.array(z.object({
    tipo: z.string().describe('Tipo de cláusula (precio, forma de pago, entrega, garantías, etc.)'),
    descripcion: z.string().describe('Contenido resumido de la cláusula'),
  })).describe('Cláusulas principales del documento'),
  montos: z.array(z.object({
    concepto: z.string().describe('Concepto del monto (precio de venta, hipoteca, honorarios, etc.)'),
    monto: z.string().describe('Valor numérico'),
    moneda: z.string().describe('Moneda (CLP, UF, USD, etc.)'),
  })).describe('Montos mencionados en el documento'),
  plazos: z.array(z.object({
    descripcion: z.string().describe('Descripción del plazo'),
    fecha: z.string().nullable().describe('Fecha límite si aplica'),
  })).describe('Plazos importantes'),
  observaciones: z.array(z.string()).describe('Observaciones relevantes, alertas o información adicional importante'),
})

const analysisResultSchema = z.object({
  documentType: z.enum([
    'inscripcion_dominio',
    'compraventa',
    'mandato',
    'hipoteca',
    'prohibicion',
    'usufructo',
    'servidumbre',
    'otro'
  ]).describe('Clasificación del tipo de documento'),
  extractedData: extractedDataSchema,
  summary: z.string().describe('Resumen ejecutivo del documento en español, máximo 3 párrafos'),
  confidence: z.number().min(0).max(1).describe('Nivel de confianza del análisis (0 a 1)'),
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Dynamic import for pdf-parse to avoid issues
    const pdfParse = (await import('pdf-parse')).default
    const pdfData = await pdfParse(buffer)
    const textContent = pdfData.text

    if (!textContent || textContent.trim().length < 50) {
      return Response.json({ 
        error: 'No se pudo extraer texto del PDF. Asegúrese de que el documento contenga texto seleccionable.' 
      }, { status: 400 })
    }

    const systemPrompt = `Eres un experto abogado chileno especializado en análisis de documentos legales.
Tu tarea es analizar documentos jurídicos chilenos y extraer información estructurada.

TIPOS DE DOCUMENTOS QUE PUEDES IDENTIFICAR:
- inscripcion_dominio: Inscripciones de dominio en el Conservador de Bienes Raíces
- compraventa: Escrituras de compraventa de inmuebles
- mandato: Mandatos generales o especiales, poderes
- hipoteca: Constitución de hipotecas
- prohibicion: Prohibiciones de gravar y enajenar
- usufructo: Constitución de usufructo
- servidumbre: Constitución de servidumbres
- otro: Cualquier otro documento legal

INSTRUCCIONES:
1. Identifica el tipo de documento
2. Extrae TODA la información relevante del texto
3. Presta especial atención a:
   - Nombres completos y RUTs de las partes
   - Datos del inmueble (dirección, deslindes, inscripción CBR)
   - Montos y formas de pago
   - Cláusulas importantes
   - Plazos y condiciones
4. Genera un resumen ejecutivo claro y conciso
5. Indica tu nivel de confianza basado en la calidad del texto extraído

IMPORTANTE: 
- Responde siempre en español
- Usa el formato de fecha chileno (DD/MM/YYYY)
- Los RUTs deben estar en formato XX.XXX.XXX-X
- Si algún campo no está presente en el documento, déjalo como null o array vacío`

    const { output } = await generateText({
      model: 'google/gemini-2.5-flash-preview-05-20',
      system: systemPrompt,
      prompt: `Analiza el siguiente documento legal chileno y extrae toda la información relevante:\n\n${textContent.substring(0, 100000)}`,
      output: Output.object({
        schema: analysisResultSchema,
      }),
      maxOutputTokens: 8000,
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

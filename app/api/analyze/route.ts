import { getPromptForType, type AnalysisType } from '@/lib/legal-prompts'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Use pdf-parse for better PDF text extraction
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Dynamic import to handle Buffer in serverless
    const pdfParse = await import('pdf-parse/lib/pdf-parse')
    const buffer = Buffer.from(arrayBuffer)
    const pdfData = await pdfParse(buffer)
    
    // pdfParse returns the text directly
    return pdfData.text || ''
  } catch (error) {
    console.error('[v0] Error with pdf-parse, trying fallback:', error)
    // Fallback: basic text extraction
    return ''
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return Response.json({ 
        error: 'Gemini API key no configurada. Configure GOOGLE_API_KEY en variables de entorno.' 
      }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const analysisType = (formData.get('analysisType') as AnalysisType) || 'auto'
    
    if (!file) {
      return Response.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    
    // Extract text using pdf-parse
    let textContent = await extractPdfText(arrayBuffer)

    console.log('[v0] PDF extracted text length:', textContent.length)
    
    if (!textContent || textContent.trim().length < 50) {
      return Response.json({ 
        error: 'No se pudo extraer texto del PDF. Asegúrese de que el documento contenga texto seleccionable.' 
      }, { status: 400 })
    }

    // Log para verificar que se envía completo
    console.log('[v0] Sending to Gemini text length:', textContent.length)

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
      ? `Analiza el siguiente documento legal chileno, identifica su tipo y extrae toda la información relevante:\n\n${textContent}`
      : `Realiza un análisis de tipo "${analysisType}" sobre el siguiente documento legal chileno:\n\n${textContent}`

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const generationConfig = {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 16000,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          analysisType: { type: 'STRING' },
          documentType: { type: 'STRING' },
          summary: { type: 'STRING' },
          informe: { type: 'STRING' },
          confidence: { type: 'NUMBER' },
          extractedData: {
            type: 'OBJECT',
            properties: {
              tipoDocumento: { type: 'STRING' },
              tipoAnalisis: { type: 'STRING' },
              fechaDocumento: { type: 'STRING' },
              partes: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    rol: { type: 'STRING' },
                    nombre: { type: 'STRING' },
                    rut: { type: 'STRING' },
                    domicilio: { type: 'STRING' },
                  },
                },
              },
              inmueble: {
                type: 'OBJECT',
                properties: {
                  direccion: { type: 'STRING' },
                  comuna: { type: 'STRING' },
                  region: { type: 'STRING' },
                  rolAvaluo: { type: 'STRING' },
                  deslindes: { type: 'STRING' },
                  inscripcion: {
                    type: 'OBJECT',
                    properties: {
                      cbr: { type: 'STRING' },
                      fojas: { type: 'STRING' },
                      numero: { type: 'STRING' },
                      ano: { type: 'STRING' },
                    },
                  },
                },
              },
              clausulas: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    tipo: { type: 'STRING' },
                    descripcion: { type: 'STRING' },
                  },
                },
              },
              montos: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    concepto: { type: 'STRING' },
                    monto: { type: 'STRING' },
                    moneda: { type: 'STRING' },
                  },
                },
              },
              alertas: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    tipo: { type: 'STRING' },
                    mensaje: { type: 'STRING' },
                  },
                },
              },
              observaciones: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
            },
          },
        },
      },
    }

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: systemPrompt + '\n\n' + userPrompt,
            },
          ],
        },
      ],
      generationConfig,
    })

    const responseText = response.response.text()
    
    try {
      const output = JSON.parse(responseText)
      return Response.json(output)
    } catch {
      // If JSON parsing fails, return the raw response wrapped in our schema
      return Response.json({
        analysisType,
        documentType: 'Desconocido',
        summary: responseText,
        informe: responseText,
        confidence: 0.5,
        extractedData: {
          tipoDocumento: 'Desconocido',
          tipoAnalisis: analysisType,
          partes: [],
          clausulas: [],
          montos: [],
          alertas: [],
          observaciones: ['Respuesta no estructurada de Gemini - revisar resultado manualmente'],
        },
      })
    }
  } catch (error) {
    console.error('Error analyzing document:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Error al procesar el documento' 
    }, { status: 500 })
  }
}

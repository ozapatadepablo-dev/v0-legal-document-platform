import { getPromptForType, type AnalysisType } from '@/lib/legal-prompts'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
    const buffer = Buffer.from(arrayBuffer)
    
    // Convert to base64 for Gemini API
    const base64Data = buffer.toString('base64')

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
      ? `Analiza el siguiente documento legal chileno (PDF adjunto), identifica su tipo y extrae toda la información relevante según el formato JSON requerido.`
      : `Realiza un análisis de tipo "${analysisType}" sobre el siguiente documento legal chileno (PDF adjunto), extrayendo toda la información según el formato JSON requerido.`

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
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig,
    })

    const responseText = response.response.text()
    
    console.log('[v0] Gemini response (first 500 chars):', responseText.substring(0, 500))
    console.log('[v0] Response length:', responseText.length)
    console.log('[v0] Response starts with:', responseText.substring(0, 50))
    
    try {
      const output = JSON.parse(responseText)
      return Response.json(output)
    } catch (e) {
      console.error('[v0] JSON parse error:', e)
      console.log('[v0] Full response:', responseText)
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

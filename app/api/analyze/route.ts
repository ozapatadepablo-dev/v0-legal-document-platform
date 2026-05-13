import { getPromptForType, type AnalysisType } from '@/lib/legal-prompts'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Get all available API keys for rotation
function getApiKeys(): string[] {
  const keys: string[] = []
  if (process.env.GOOGLE_API_KEY) keys.push(process.env.GOOGLE_API_KEY)
  return keys
}

export async function POST(req: Request) {
  try {
    const apiKeys = getApiKeys()
    if (apiKeys.length === 0) {
      return Response.json(
        { error: 'No hay API keys configuradas. Configure GOOGLE_API_KEY en variables de entorno.' },
        { status: 500 }
      )
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
2. Sigue el formato de salida estructurado en JSON
3. En el campo "informe" genera un informe completo y formateado según el tipo de análisis
4. Si detectas información faltante o problemas, agrégalos en "alertas"
5. Usa el formato de fecha chileno (DD/MM/YYYY)
6. Los RUTs deben estar en formato XX.XXX.XXX-X
7. Si algún campo no está presente, déjalo como null o array vacío
8. El resumen debe ser conciso (máximo 3 párrafos)
9. El informe debe ser completo y seguir la estructura del tipo de análisis seleccionado

IMPORTANTE: Responde siempre en español chileno legal. La respuesta DEBE ser un JSON válido.`

    const userPrompt = analysisType === 'auto'
      ? `Analiza el siguiente documento legal chileno (PDF adjunto), identifica su tipo y extrae toda la información relevante según el formato JSON requerido.`
      : `Realiza un análisis de tipo "${analysisType}" sobre el siguiente documento legal chileno (PDF adjunto), extrayendo toda la información según el formato JSON requerido.`

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
              partes: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    rol: { type: 'STRING' },
                    nombre: { type: 'STRING' },
                    rut: { type: 'STRING' },
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

    // Try with each API key until one works
    let lastError: any
    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
      try {
        const apiKey = apiKeys[keyIndex]
        console.log(`[v0] Intentando con API Key ${keyIndex + 1}/${apiKeys.length}`)

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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

        if (!response) {
          throw new Error('No response from Gemini')
        }

        const responseText = response.response.text()

        console.log('[v0] Gemini response (first 500 chars):', responseText.substring(0, 500))
        console.log('[v0] Response length:', responseText.length)

        try {
          const output = JSON.parse(responseText)
          return Response.json(output)
        } catch (e) {
          console.error('[v0] JSON parse error:', e)
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
      } catch (error: any) {
        lastError = error
        console.error(`[v0] API Key ${keyIndex + 1} falló:`, error.message)

        // If it's a quota error (429) and there are more keys, try the next one
        if (error.status === 429 && keyIndex < apiKeys.length - 1) {
          console.log(`[v0] Cuota agotada, intentando siguiente API Key...`)
          continue
        }

        // If it's the last key or not a quota error, throw
        if (keyIndex === apiKeys.length - 1) {
          throw error
        }
      }
    }

    throw lastError || new Error('No se pudo procesar con ninguna API Key')
  } catch (error) {
    console.error('Error analyzing document:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error al procesar el documento' },
      { status: 500 }
    )
  }
}

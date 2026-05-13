import { getPromptForType, type AnalysisType } from '@/lib/legal-prompts'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      console.error('[v0] GOOGLE_API_KEY no está definida')
      return Response.json(
        { error: 'API Key no configurada' },
        { status: 500 }
      )
    }

    console.log('[v0] API Key última 10 chars:', apiKey.slice(-10))

    const formData = await req.formData()
    const file = formData.get('file') as File
    const analysisType = (formData.get('analysisType') as AnalysisType) || 'auto'

    if (!file) {
      return Response.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
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

    console.log('[v0] Creando cliente Gemini...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    console.log('[v0] Enviando petición a Gemini...')
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
    console.log('[v0] Respuesta recibida, parseando JSON...')

    try {
      const output = JSON.parse(responseText)
      console.log('[v0] JSON parseado exitosamente')
      return Response.json(output)
    } catch (e) {
      console.error('[v0] Error parseando JSON:', e)
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
          observaciones: ['Respuesta no estructurada de Gemini'],
        },
      })
    }
  } catch (error) {
    console.error('[v0] Error analyzing document:', error instanceof Error ? error.message : error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error al procesar el documento' },
      { status: 500 }
    )
  }
}

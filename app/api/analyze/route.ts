import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getPromptForType, type AnalysisType } from '@/lib/legal-prompts'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
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
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')

    const specificPrompt = getPromptForType(analysisType)

    const systemPrompt = `${specificPrompt}

INSTRUCCIONES GENERALES:
1. Analiza el documento completo y extrae TODA la información relevante
2. Responde en formato JSON válido
3. En el campo "informe" genera un informe completo y formateado según el tipo de análisis
4. Si detectas información faltante o problemas, agrégalos en "alertas"
5. Usa el formato de fecha chileno (DD/MM/YYYY)
6. Los RUTs deben estar en formato XX.XXX.XXX-X
7. El resumen debe ser conciso (máximo 3 párrafos)

IMPORTANTE: Responde siempre en español chileno legal. La respuesta DEBE ser un JSON válido con esta estructura:
{
  "analysisType": "tipo de análisis",
  "documentType": "tipo de documento",
  "summary": "resumen del documento",
  "informe": "informe completo formateado",
  "confidence": 0.95,
  "extractedData": {
    "tipoDocumento": "string",
    "partes": [{"rol": "string", "nombre": "string", "rut": "string"}],
    "clausulas": [{"tipo": "string", "descripcion": "string"}],
    "montos": [{"concepto": "string", "monto": "string"}],
    "alertas": [{"tipo": "string", "mensaje": "string"}],
    "observaciones": ["string"]
  }
}`

    const userPrompt = analysisType === 'auto'
      ? `Analiza el siguiente documento legal chileno, identifica su tipo y extrae toda la información relevante según el formato JSON requerido.`
      : `Realiza un análisis de tipo "${analysisType}" sobre el siguiente documento legal chileno, extrayendo toda la información según el formato JSON requerido.`

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: base64Data,
              mediaType: 'application/pdf',
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
    })

    const responseText = result.text

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const output = JSON.parse(jsonMatch[0])
        return Response.json(output)
      }
      throw new Error('No JSON found')
    } catch {
      return Response.json({
        analysisType,
        documentType: 'Documento Legal',
        summary: responseText.substring(0, 500),
        informe: responseText,
        confidence: 0.7,
        extractedData: {
          tipoDocumento: 'Documento Legal',
          partes: [],
          clausulas: [],
          montos: [],
          alertas: [],
          observaciones: ['Análisis completado'],
        },
      })
    }
  } catch (error) {
    console.error('[v0] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error al procesar el documento' },
      { status: 500 }
    )
  }
}

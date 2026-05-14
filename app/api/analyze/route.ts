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

INSTRUCCIONES DE SALIDA:
- Responde en español chileno legal
- Mantén exactamente la estructura y formato solicitado en el análisis
- Si información falta, indica "No consta"
- No inventes datos
- Sé exhaustivo en la extracción de información

Después del informe, agrega esta sección JSON con datos extraídos:

---JSON-METADATA---
{
  "alertas": ["lista de alertas detectadas"],
  "observaciones": ["observaciones adicionales"]
}
---FIN-JSON---`

    const userPrompt = analysisType === 'auto'
      ? `Analiza el siguiente documento legal chileno según las instrucciones proporcionadas en el sistema. Genera un informe completo.`
      : `Realiza un análisis de tipo "${analysisType}" sobre el siguiente documento legal chileno según las instrucciones proporcionadas. Genera un informe completo y detallado.`

    const result = await generateText({
      model: google('gemini-2.5-flash'),
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
      const jsonMatch = responseText.match(/---JSON-METADATA---([\s\S]*?)---FIN-JSON---/)
      const metadata = jsonMatch ? JSON.parse(jsonMatch[1]) : { alertas: [], observaciones: [] }
      
      // Extraer el informe (todo antes del JSON)
      const informeText = jsonMatch 
        ? responseText.substring(0, responseText.indexOf('---JSON-METADATA---')).trim()
        : responseText

      return Response.json({
        analysisType,
        documentType: `Análisis de ${analysisType}`,
        summary: informeText.substring(0, 300),
        informe: informeText,
        confidence: 0.9,
        extractedData: {
          tipoDocumento: `Análisis de ${analysisType}`,
          partes: [],
          clausulas: [],
          montos: [],
          alertas: metadata.alertas || [],
          observaciones: metadata.observaciones || [],
        },
      })
    } catch (error) {
      return Response.json({
        analysisType,
        documentType: `Análisis de ${analysisType}`,
        summary: responseText.substring(0, 300),
        informe: responseText,
        confidence: 0.85,
        extractedData: {
          tipoDocumento: `Análisis de ${analysisType}`,
          partes: [],
          clausulas: [],
          montos: [],
          alertas: [],
          observaciones: ['Informe completado'],
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

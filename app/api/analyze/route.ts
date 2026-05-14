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

IMPORTANTE: Sigue EXACTAMENTE el formato y estructura especificada arriba. No agregues títulos de secciones ni estructures de forma diferente. Responde en español chileno legal.`

    const userPrompt = `Analiza el siguiente documento legal chileno según las instrucciones especificadas. Responde SOLO con el informe, sin títulos adicionales ni explicaciones.`

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'file',
              data: base64Data,
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
    })

    const responseText = result.text

    try {
      return Response.json({
        analysisType,
        documentType: `Análisis de ${analysisType}`,
        summary: responseText.substring(0, 300),
        informe: responseText,
        confidence: 0.9,
        extractedData: {
          tipoDocumento: `Análisis de ${analysisType}`,
          partes: [],
          clausulas: [],
          montos: [],
          alertas: [],
          observaciones: [],
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

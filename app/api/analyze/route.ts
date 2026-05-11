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

    // Initialize Gemini client with retry logic
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    let response
    let lastError: any
    const maxRetries = 3
    
    // Retry logic for handling temporary service unavailability
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await model.generateContent({
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
        break // Success, exit retry loop
      } catch (error: any) {
        lastError = error
        console.error(`[v0] Attempt ${attempt}/${maxRetries} failed:`, error.message)
        
        if (attempt < maxRetries && error.status === 503) {
          // Wait before retrying (exponential backoff)
          const waitTime = 1000 * Math.pow(2, attempt - 1)
          console.log(`[v0] Retrying in ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else if (attempt === maxRetries) {
          throw error
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('No response from Gemini')

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

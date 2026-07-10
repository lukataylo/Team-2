import { generateText, Output } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })

const VariantSchema = z.object({
  title: z.string().describe('Short punchy name for this UI concept'),
  rationale: z.string().describe('One sentence on why this reinterpretation works'),
  navStyle: z.enum(['minimal', 'tabs', 'sidebar']),
  heroText: z.string().describe('A short hero headline for this concept'),
  ctaText: z.string().describe('Call-to-action button label'),
  accentColor: z.string().describe('A hex color code, e.g. #5fb0ff'),
})

const PROMPT = 'You are a UX design assistant. Look at this UI screenshot and propose 4 distinct alternative "icebreaker" UI concepts as fresh reinterpretations for the same product. Vary the tone and layout meaningfully across the 4.'

function callModel(model, mediaType, imageDataUrl) {
  return generateText({
    model,
    output: Output.array({ element: VariantSchema }),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'file', mediaType, data: imageDataUrl },
        ],
      },
    ],
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { imageDataUrl } = req.body || {}
  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    res.status(400).json({ error: 'imageDataUrl is required' })
    return
  }

  const mimeMatch = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)
  if (!mimeMatch) {
    res.status(400).json({ error: 'imageDataUrl must be a base64 image data URL' })
    return
  }

  try {
    const result = await callModel(openai('gpt-5'), mimeMatch[1], imageDataUrl)
    res.status(200).json({ variants: result.output })
  } catch (openaiErr) {
    try {
      const result = await callModel(google('gemini-flash-latest'), mimeMatch[1], imageDataUrl)
      res.status(200).json({ variants: result.output })
    } catch (geminiErr) {
      res.status(502).json({ error: geminiErr.message || openaiErr.message || 'Generation failed' })
    }
  }
}

import { generateText, Output } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const VariantSchema = z.object({
  title: z.string().describe('Short punchy name for this UI concept'),
  rationale: z.string().describe('One sentence on why this reinterpretation works'),
  navStyle: z.enum(['minimal', 'tabs', 'sidebar']),
  heroText: z.string().describe('A short hero headline for this concept'),
  ctaText: z.string().describe('Call-to-action button label'),
  accentColor: z.string().describe('A hex color code, e.g. #5fb0ff'),
})

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

  try {
    const result = await generateText({
      model: openai('gpt-5'),
      output: Output.array({ element: VariantSchema }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are a UX design assistant. Look at this UI screenshot and propose 4 distinct alternative "icebreaker" UI concepts as fresh reinterpretations for the same product. Vary the tone and layout meaningfully across the 4.',
            },
            { type: 'file', mediaType: 'image', data: imageDataUrl },
          ],
        },
      ],
    })

    res.status(200).json({ variants: result.output })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Generation failed' })
  }
}

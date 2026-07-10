import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const ANGLES = [
  { label: 'Minimal', prompt: 'a stripped-back, minimal reinterpretation with lots of white space and one clear action' },
  { label: 'Playful', prompt: 'a playful, colorful reinterpretation with a fun, casual tone' },
  { label: 'Professional', prompt: 'a professional, enterprise-grade reinterpretation with a dense, trustworthy layout' },
  { label: 'Bold', prompt: 'a bold, high-contrast reinterpretation with oversized type and strong visual hierarchy' },
]

function generateVariantImage(mediaType, imageDataUrl, angle) {
  return generateText({
    model: google('gemini-2.5-flash-image'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a UX design assistant. Look at this UI screenshot and generate a new UI mockup image that reimagines it as ${angle.prompt}. Keep the same core purpose and content, but redesign the layout and visual style. Output only the image.`,
          },
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
    // ponytail: sequential, not Promise.all — free-tier Gemini image quotas are per-minute and tight.
    const variants = []
    for (const angle of ANGLES) {
      const result = await generateVariantImage(mimeMatch[1], imageDataUrl, angle)
      const file = result.files.find((f) => f.mediaType.startsWith('image/'))
      if (!file) throw new Error(`No image returned for the "${angle.label}" concept`)
      variants.push({ label: angle.label, imageDataUrl: `data:${file.mediaType};base64,${file.base64}` })
    }

    res.status(200).json({ variants })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Generation failed' })
  }
}

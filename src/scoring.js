// ponytail: keyword-based mock of "AI" specificity scoring, no API call, zero latency.

const SPECIFIC_TERMS = [
  'contrast', 'spacing', 'padding', 'margin', 'align', 'alignment', 'hierarchy',
  'font', 'size', 'color', 'colour', 'icon', 'label', 'button', 'cta',
  'nav', 'header', 'footer', 'field', 'checkbox', 'input', 'placeholder',
  'error', 'focus', 'hover', 'tap target', 'mobile', 'responsive', 'breakpoint',
  'px', '%', 'em', 'rem', 'z-index', 'overlap', 'truncat', 'wrap', 'crowd',
  'price', 'total', 'checkout', 'step', 'flow', 'copy', 'wording', 'affordance',
]

const CAUSAL_TERMS = ['because', 'so that', 'which means', 'makes it hard', 'makes it difficult', 'so users', 'so that users']

const VAGUE_ONLY = ['bad', 'good', 'nice', 'ugly', 'weird', 'meh', "don't like", "dont like", 'not great', 'looks off']

export function scoreFeedback(text) {
  const clean = text.trim()
  const lower = clean.toLowerCase()
  const wordCount = clean.split(/\s+/).filter(Boolean).length

  const specificHits = SPECIFIC_TERMS.filter((t) => lower.includes(t)).length
  const hasCausal = CAUSAL_TERMS.some((t) => lower.includes(t))
  const hasNumber = /\d/.test(clean)
  const isVagueOnly = wordCount < 8 && specificHits === 0

  if (!clean || isVagueOnly) {
    return {
      accepted: false,
      xp: 0,
      message: VAGUE_ONLY.some((t) => lower.includes(t))
        ? "That's a vibe, not feedback. Name the element and the effect — try again."
        : 'Too vague to act on. What element, and what should change?',
    }
  }

  let xp = 10 + Math.min(wordCount, 30) + specificHits * 12 + (hasCausal ? 15 : 0) + (hasNumber ? 8 : 0)
  xp = Math.min(Math.round(xp), 100)

  return { accepted: true, xp, message: null }
}

export const SEVERITY = {
  minor: { label: 'Minor', multiplier: 1, color: '#5fb0ff' },
  major: { label: 'Major', multiplier: 1.5, color: '#ffb02e' },
  critical: { label: 'Critical', multiplier: 2, color: '#ff4d5e' },
}

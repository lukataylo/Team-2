import { useState } from 'react'
import { scoreFeedback, SEVERITY } from './scoring'

export default function FeedbackCard({ onResolved, ctaLabel }) {
  const [text, setText] = useState('')
  const [severity, setSeverity] = useState('major')
  const [result, setResult] = useState(null) // { accepted, xp, message }
  const [shake, setShake] = useState(false)

  function submit(e) {
    e.preventDefault()
    const r = scoreFeedback(text)
    if (!r.accepted) {
      setResult(r)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    const damage = Math.round(r.xp * SEVERITY[severity].multiplier)
    setResult(r)
    setTimeout(() => {
      onResolved({ text, severity, xp: r.xp, damage })
      setText('')
      setResult(null)
    }, 900)
  }

  const flipped = result?.accepted
  const s = SEVERITY[severity]

  return (
    <form className={`card ${flipped ? 'card--flipped' : ''} ${shake ? 'card--shake' : ''}`} onSubmit={submit}>
      <div className="card__inner">
        <div className="card__face card__front">
          <label className="card__label">Observation</label>
          <textarea
            className="card__textarea"
            placeholder="What did you notice? Name the element, the problem, and the effect on the user…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          <div className="card__row">
            <div className="card__severities">
              {Object.entries(SEVERITY).map(([key, val]) => (
                <button
                  type="button"
                  key={key}
                  className={`chip ${severity === key ? 'chip--active' : ''}`}
                  style={{ '--chip-color': val.color }}
                  onClick={() => setSeverity(key)}
                >
                  {val.label}
                </button>
              ))}
            </div>
            <button type="submit" className="card__submit">{ctaLabel}</button>
          </div>
          {result && !result.accepted && (
            <p className="card__bounce">⚠️ {result.message}</p>
          )}
        </div>
        <div className="card__face card__back" style={{ borderColor: s.color }}>
          {result?.accepted && (
            <>
              <div className="card__xp">+{result.xp} XP</div>
              <div className="card__damage" style={{ color: s.color }}>
                {Math.round(result.xp * s.multiplier)} DMG
              </div>
              <div className="card__sev" style={{ background: s.color }}>{s.label}</div>
            </>
          )}
        </div>
      </div>
    </form>
  )
}

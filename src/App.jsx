import { useState } from 'react'
import DesignMockup from './DesignMockup'
import FeedbackCard from './FeedbackCard'
import Confetti from './Confetti'
import './App.css'

const BOSS_MAX_HP = 250

export default function App() {
  const [phase, setPhase] = useState('warmup') // warmup | boss | victory
  const [warmupCards, setWarmupCards] = useState([])
  const [bossCards, setBossCards] = useState([])
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP)

  const totalXp = [...warmupCards, ...bossCards].reduce((sum, c) => sum + c.xp, 0)

  function handleWarmup(card) {
    setWarmupCards((cards) => [card, ...cards])
  }

  function handleAttack(card) {
    setBossCards((cards) => [card, ...cards])
    setBossHp((hp) => {
      const next = Math.max(0, hp - card.damage)
      if (next === 0) setPhase('victory')
      return next
    })
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>⚔️ Crit Quest</h1>
        <div className="app__xp">Total XP: {totalXp}</div>
      </header>

      {phase === 'warmup' && (
        <section className="stage">
          <p className="stage__blurb">
            🧪 <strong>Warm-up round.</strong> This is a decoy the AI deliberately broke. Rip it apart —
            no consequences here, it's practice before the real fight.
          </p>
          <div className="stage__layout">
            <DesignMockup variant="decoy" />
            <div className="stage__cards">
              <FeedbackCard onResolved={handleWarmup} ctaLabel="Log observation" />
              <div className="card-list">
                {warmupCards.map((c, i) => (
                  <ResolvedCard key={i} card={c} />
                ))}
              </div>
            </div>
          </div>
          <button
            className="cta cta--big"
            disabled={warmupCards.length === 0}
            onClick={() => setPhase('boss')}
          >
            {warmupCards.length === 0 ? 'Log at least one observation to continue' : 'Start boss fight →'}
          </button>
        </section>
      )}

      {phase === 'boss' && (
        <section className="stage">
          <p className="stage__blurb">
            🐉 <strong>Boss fight.</strong> This is the real design. Every specific piece of feedback
            hits the boss; vague feedback bounces right back at you.
          </p>
          <HpBar hp={bossHp} max={BOSS_MAX_HP} />
          <div className="stage__layout">
            <DesignMockup variant="boss" />
            <div className="stage__cards">
              <FeedbackCard onResolved={handleAttack} ctaLabel="Attack!" />
              <div className="card-list">
                {bossCards.map((c, i) => (
                  <ResolvedCard key={i} card={c} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {phase === 'victory' && (
        <section className="stage stage--victory">
          <Confetti />
          <h2 className="victory__title">🏆 Boss defeated!</h2>
          <p>
            The team landed {bossCards.length} hits for {totalXp} total XP. Design problems: exposed.
          </p>
        </section>
      )}
    </div>
  )
}

function HpBar({ hp, max }) {
  const pct = Math.round((hp / max) * 100)
  return (
    <div className="hpbar">
      <div className="hpbar__label">Boss HP</div>
      <div className="hpbar__track">
        <div className="hpbar__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="hpbar__value">{hp} / {max}</div>
    </div>
  )
}

function ResolvedCard({ card }) {
  return (
    <div className="resolved">
      <span className="resolved__sev" data-sev={card.severity}>{card.severity}</span>
      <span className="resolved__text">{card.text}</span>
      <span className="resolved__xp">+{card.xp} XP</span>
    </div>
  )
}

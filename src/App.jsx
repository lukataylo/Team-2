import { useRef, useState } from 'react'
import DesignMockup from './DesignMockup'
import FeedbackCard from './FeedbackCard'
import Confetti from './Confetti'
import IcebreakerCanvas from './IcebreakerCanvas'
import {
  PointerIcon, FrameIcon, TextIcon, NoteIcon, ShapeIcon, PenIcon, CommentIcon, EraserIcon, MoreIcon,
  ZoomOutIcon, ZoomInIcon, UndoIcon, RedoIcon, MapIcon, SparkleIcon, ShareIcon,
} from './icons'
import './App.css'

const BOSS_MAX_HP = 250
const TOOLS = [
  { key: 'pointer', Icon: PointerIcon, label: 'Select' },
  { key: 'frame', Icon: FrameIcon, label: 'Frame' },
  { key: 'text', Icon: TextIcon, label: 'Text' },
  { key: 'note', Icon: NoteIcon, label: 'Sticky note' },
  { key: 'shape', Icon: ShapeIcon, label: 'Shape' },
  { key: 'pen', Icon: PenIcon, label: 'Pen' },
  { key: 'comment', Icon: CommentIcon, label: 'Comment' },
  { key: 'eraser', Icon: EraserIcon, label: 'Eraser' },
]
const AVATARS = [
  { initials: 'LD', color: '#000000' },
  { initials: 'AN', color: '#4a4a4a' },
  { initials: 'RY', color: '#9a9a9a' },
]

export default function App() {
  const [view, setView] = useState('canvas') // canvas | gamification
  const [tool, setTool] = useState('pointer')
  const [canvasView, setCanvasView] = useState({ x: 0, y: 0, zoom: 1 })
  const fileInputRef = useRef(null)

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

  function zoomBy(delta) {
    setCanvasView((v) => ({ ...v, zoom: Math.min(2, Math.max(0.3, v.zoom + delta)) }))
  }

  function handleAiAssistantClick() {
    setView('canvas')
    fileInputRef.current?.click()
  }

  return (
    <div className="board">
      <header className="board__topbar">
        <div className="board__brand">
          <span className="board__logo">⚔️</span>
          <span className="board__name">Crit Quest board</span>
        </div>

        <nav className="tabs">
          <button className={`tabs__tab ${view === 'canvas' ? 'tabs__tab--active' : ''}`} onClick={() => setView('canvas')}>
            Canvas
          </button>
          <button className={`tabs__tab ${view === 'gamification' ? 'tabs__tab--active' : ''}`} onClick={() => setView('gamification')}>
            🎮 Gamification
          </button>
        </nav>

        <div className="board__topbar-right">
          <button className="ai-pill" onClick={handleAiAssistantClick}>
            <SparkleIcon /> AI Assistant
          </button>
          <div className="avatars">
            {AVATARS.map((a) => (
              <span key={a.initials} className="avatars__item" style={{ background: a.color }}>
                {a.initials}
              </span>
            ))}
          </div>
          <button className="share-btn">
            <ShareIcon /> Share
          </button>
        </div>
      </header>

      <div className="board__body">
        <aside className="board__rail">
          {TOOLS.map(({ key, Icon, label }) => (
            <button
              key={key}
              className={`rail__btn ${tool === key ? 'rail__btn--active' : ''}`}
              title={label}
              onClick={() => setTool(key)}
            >
              <Icon />
            </button>
          ))}
          <div className="rail__spacer" />
          <button className="rail__btn" title="More tools">
            <MoreIcon />
          </button>
        </aside>

        <main className="board__main">
          {view === 'canvas' && (
            <IcebreakerCanvas view={canvasView} setView={setCanvasView} fileInputRef={fileInputRef} />
          )}

          {view === 'gamification' && (
            <div className="gamification">
              <div className="app__xp app__xp--inline">Total XP: {totalXp}</div>

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
          )}
        </main>
      </div>

      {view === 'canvas' && (
        <div className="board__bottombar">
          <button className="bottombar__btn" onClick={() => zoomBy(-0.1)} title="Zoom out">
            <ZoomOutIcon />
          </button>
          <span className="bottombar__zoom">{Math.round(canvasView.zoom * 100)}%</span>
          <button className="bottombar__btn" onClick={() => zoomBy(0.1)} title="Zoom in">
            <ZoomInIcon />
          </button>
          <span className="bottombar__divider" />
          <button className="bottombar__btn" title="Undo" disabled>
            <UndoIcon />
          </button>
          <button className="bottombar__btn" title="Redo" disabled>
            <RedoIcon />
          </button>
          <span className="bottombar__divider" />
          <button className="bottombar__btn" title="Minimap" disabled>
            <MapIcon />
          </button>
        </div>
      )}

      <button className="fab" onClick={handleAiAssistantClick} title="Generate with AI">
        <SparkleIcon />
      </button>
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

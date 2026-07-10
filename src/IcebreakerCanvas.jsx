import { useRef, useState } from 'react'

const MAX_DIM = 1024

function downscaleToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// ponytail: hand-rolled drag-to-pan + wheel-to-zoom, a Figma-style canvas is just a CSS transform.
export default function IcebreakerCanvas({ view, setView, fileInputRef }) {
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')
  const [variants, setVariants] = useState([])
  const dragRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await downscaleToDataUrl(file)
    setImageDataUrl(dataUrl)
    setVariants([])
  }

  async function generate() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/generate-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
      const { variants } = await res.json()
      setVariants(
        variants.map((v, i) => ({
          ...v,
          x: 60 + (i % 2) * 380,
          y: 60 + Math.floor(i / 2) * 320,
        }))
      )
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  function onPointerDown(e) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: view.x, origY: view.y }
  }
  function onPointerMove(e) {
    if (!dragRef.current) return
    const { startX, startY, origX, origY } = dragRef.current
    setView((v) => ({ ...v, x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) }))
  }
  function onPointerUp() {
    dragRef.current = null
  }
  function onWheel(e) {
    e.preventDefault()
    setView((v) => ({ ...v, zoom: Math.min(2, Math.max(0.3, v.zoom - e.deltaY * 0.001)) }))
  }

  return (
    <div
      className="canvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <div className="icebreaker__toolbar">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} />
        <button className="cta" disabled={!imageDataUrl || status === 'loading'} onClick={generate}>
          {status === 'loading' ? 'Generating…' : 'Generate icebreaker UIs'}
        </button>
        {imageDataUrl && <img className="icebreaker__preview" src={imageDataUrl} alt="Uploaded design" />}
        {status === 'error' && <p className="card__bounce">⚠️ {errorMsg}</p>}
      </div>

      {variants.length === 0 && status !== 'loading' && (
        <p className="canvas__hint">
          🧊 Upload a UI screenshot above — the AI sketches 4 alternative "icebreaker" concepts here.
          Drag to pan, scroll to zoom.
        </p>
      )}

      <div
        className="canvas__world"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
      >
        {variants.map((v, i) => (
          <div key={i} className="variant-card" style={{ left: v.x, top: v.y }}>
            <div className="variant-card__nav">{v.navStyle}</div>
            <div className="variant-card__body">
              <h3>{v.title}</h3>
              <p className="variant-card__hero">{v.heroText}</p>
              <button className="variant-card__cta">{v.ctaText}</button>
              <p className="variant-card__rationale">{v.rationale}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'
import { TOOLS_REGISTRY } from './tools/registry'

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

function makeId() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ponytail: hand-rolled drag-to-pan + wheel-to-zoom, a Figma-style canvas is just a CSS transform.
export default function IcebreakerCanvas({ view, setView, tool, setTool, elements, setElements }) {
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')
  const [variants, setVariants] = useState([])
  const canvasRef = useRef(null)
  const panRef = useRef(null)
  const draggingElRef = useRef(null)
  const creatingRef = useRef(null)

  function addElement(data) {
    setElements((els) => [...els, data])
  }
  function updateElement(id, patch) {
    setElements((els) => els.map((el) => (el.id === id ? { ...el, ...patch } : el)))
  }
  function removeElement(id) {
    setElements((els) => els.filter((el) => el.id !== id))
  }

  function getCanvasPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - view.x) / view.zoom,
      y: (e.clientY - rect.top - view.y) / view.zoom,
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await downscaleToDataUrl(file)
    setImageDataUrl(dataUrl)
    setVariants([])
  }

  async function handleDropImage(e) {
    e.preventDefault()
    const file = [...(e.dataTransfer?.files || [])].find((f) => f.type.startsWith('image/'))
    if (!file) return
    const dataUrl = await downscaleToDataUrl(file)
    const point = getCanvasPoint(e)
    addElement({ id: makeId(), type: 'image', x: point.x, y: point.y, src: dataUrl })
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

  function onCanvasPointerDown(e) {
    const hitId = e.target.closest?.('[data-element-id]')?.dataset.elementId

    if (tool === 'pointer') {
      if (hitId) return // the element's own handler starts the drag
      panRef.current = { startX: e.clientX, startY: e.clientY, origX: view.x, origY: view.y }
      return
    }

    if (tool === 'eraser') {
      if (hitId) removeElement(hitId)
      return
    }

    const toolDef = TOOLS_REGISTRY[tool]
    if (!toolDef || hitId) return
    e.preventDefault() // keep the browser from stealing focus from the new element's autoFocus input
    const point = getCanvasPoint(e)
    const created = toolDef.onCreate(point)
    if (!created) return
    const id = makeId()
    addElement({ id, type: tool, x: point.x, y: point.y, ...created })
    if (toolDef.onDrag) {
      creatingRef.current = id
    } else {
      setTool('pointer')
    }
  }

  function onCanvasPointerMove(e) {
    if (panRef.current) {
      const { startX, startY, origX, origY } = panRef.current
      setView((v) => ({ ...v, x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) }))
      return
    }
    if (draggingElRef.current) {
      const point = getCanvasPoint(e)
      const { id, offsetX, offsetY } = draggingElRef.current
      updateElement(id, { x: point.x - offsetX, y: point.y - offsetY })
      return
    }
    if (creatingRef.current) {
      const toolDef = TOOLS_REGISTRY[tool]
      const el = elements.find((el) => el.id === creatingRef.current)
      if (el && toolDef?.onDrag) updateElement(el.id, toolDef.onDrag(el, getCanvasPoint(e)))
    }
  }

  function onCanvasPointerUp() {
    panRef.current = null
    draggingElRef.current = null
    if (creatingRef.current) {
      creatingRef.current = null
      setTool('pointer')
    }
  }

  function onWheel(e) {
    e.preventDefault()
    setView((v) => ({ ...v, zoom: Math.min(2, Math.max(0.3, v.zoom - e.deltaY * 0.001)) }))
  }

  function startDraggingElement(e, el) {
    if (tool !== 'pointer') return
    e.stopPropagation()
    const point = getCanvasPoint(e)
    draggingElRef.current = { id: el.id, offsetX: point.x - el.x, offsetY: point.y - el.y }
  }

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerLeave={onCanvasPointerUp}
      onWheel={onWheel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropImage}
    >
      <div className="icebreaker__toolbar">
        <input type="file" accept="image/*" onChange={handleFile} />
        <button className="cta" disabled={!imageDataUrl || status === 'loading'} onClick={generate}>
          {status === 'loading' ? 'Generating…' : 'Generate icebreaker UIs'}
        </button>
        {imageDataUrl && <img className="icebreaker__preview" src={imageDataUrl} alt="Uploaded design" />}
        {status === 'error' && <p className="card__bounce">⚠️ {errorMsg}</p>}
      </div>

      {variants.length === 0 && elements.length === 0 && status !== 'loading' && (
        <p className="canvas__hint">
          🧊 Upload a UI screenshot above — the AI sketches 4 alternative "icebreaker" concepts here.
          Drop image files anywhere to add your own screens. Drag to pan, scroll to zoom, or pick a
          tool from the left rail to annotate.
        </p>
      )}

      <div
        className="canvas__world"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
      >
        {variants.map((v, i) => (
          <div key={i} className="variant-card" style={{ left: v.x, top: v.y }}>
            <div className="variant-card__nav">{v.label}</div>
            <img className="variant-card__image" src={v.imageDataUrl} alt={`${v.label} concept`} />
          </div>
        ))}

        {elements.map((el) => {
          const toolDef = TOOLS_REGISTRY[el.type]
          if (!toolDef) return null
          return (
            <div
              key={el.id}
              data-element-id={el.id}
              className={`canvas-element ${tool === 'pointer' ? 'canvas-element--pointer' : ''}`}
              style={{ left: el.x, top: el.y }}
              onPointerDown={(e) => startDraggingElement(e, el)}
            >
              <toolDef.Element
                element={el}
                onChange={(patch) => updateElement(el.id, patch)}
                onRemove={() => removeElement(el.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

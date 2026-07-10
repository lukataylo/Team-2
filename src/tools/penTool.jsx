// Tool contract: onCreate(point) -> initial element data (x/y/id/type added by caller).
// Optional onDrag(element, point) -> patch, called while the mouse is held down after creation.
// Element({ element, onChange, onRemove }) renders the element's contents inside a positioned wrapper
// that the canvas scaffold already provides (drag-to-move, click-to-erase) — just render the visuals here.

import './penTool.css'

const STROKE_PAD = 6

function PenElement({ element }) {
  const points = element.points && element.points.length ? element.points : [{ x: 0, y: 0 }]

  let minX = points[0].x
  let minY = points[0].y
  let maxX = points[0].x
  let maxY = points[0].y

  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  const shiftX = -minX + STROKE_PAD
  const shiftY = -minY + STROKE_PAD
  const width = maxX - minX + STROKE_PAD * 2
  const height = maxY - minY + STROKE_PAD * 2

  const polylinePoints = points.map((p) => `${p.x + shiftX},${p.y + shiftY}`).join(' ')

  return (
    <svg
      className="pen-el"
      width={width}
      height={height}
      style={{ position: 'absolute', left: minX - STROKE_PAD, top: minY - STROKE_PAD, overflow: 'visible' }}
    >
      <polyline
        className="pen-el__stroke"
        points={polylinePoints}
        fill="none"
        stroke="#000"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  )
}

export default {
  key: 'pen',
  onCreate() {
    return { points: [{ x: 0, y: 0 }] }
  },
  onDrag(element, point) {
    return {
      points: [...element.points, { x: point.x - element.x, y: point.y - element.y }],
    }
  },
  Element: PenElement,
}

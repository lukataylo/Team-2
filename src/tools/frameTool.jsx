// Tool contract: onCreate(point) -> initial element data (x/y/id/type added by caller).
// Optional onDrag(element, point) -> patch, called while the mouse is held down after creation.
// Element({ element, onChange, onRemove }) renders the element's contents inside a positioned wrapper
// that the canvas scaffold already provides (drag-to-move, click-to-erase) — just render the visuals here.

function FrameElement({ element }) {
  return (
    <div className="frame-el" style={{ width: element.width, height: element.height }}>
      <span className="frame-el__label">{element.label}</span>
    </div>
  )
}

export default {
  key: 'frame',
  onCreate() {
    return { width: 200, height: 140, label: 'Frame' }
  },
  onDrag(element, point) {
    return {
      width: Math.max(40, point.x - element.x),
      height: Math.max(40, point.y - element.y),
    }
  },
  Element: FrameElement,
}

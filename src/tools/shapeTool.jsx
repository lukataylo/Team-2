// Tool contract: onCreate(point) -> initial element data (x/y/id/type added by caller).
// Optional onDrag(element, point) -> patch, called while the mouse is held down after creation.
// Element({ element, onChange, onRemove }) renders the element's contents inside a positioned wrapper
// that the canvas scaffold already provides (drag-to-move, click-to-erase) — just render the visuals here.

import './shapeTool.css'

function ShapeElement({ element }) {
  return (
    <div
      className="shape-el"
      style={{ width: element.width, height: element.height }}
    />
  )
}

export default {
  key: 'shape',
  onCreate() {
    return { width: 0, height: 0 }
  },
  onDrag(element, point) {
    return {
      width: Math.max(10, point.x - element.x),
      height: Math.max(10, point.y - element.y),
    }
  },
  Element: ShapeElement,
}

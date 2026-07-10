// Tool contract: onCreate(point) -> initial element data (x/y/id/type added by caller).
// Optional onDrag(element, point) -> patch, called while the mouse is held down after creation.
// Element({ element, onChange, onRemove }) renders the element's contents inside a positioned wrapper
// that the canvas scaffold already provides (drag-to-move, click-to-erase) — just render the visuals here.
import './textTool.css'

function TextElement({ element, onChange }) {
  if (element.editing) {
    return (
      <textarea
        className="text-el__input"
        autoFocus
        value={element.text}
        placeholder="Type something…"
        onChange={(e) => onChange({ text: e.target.value })}
        onBlur={() => onChange({ editing: false })}
      />
    )
  }

  const isEmpty = !element.text
  return (
    <div
      className={isEmpty ? 'text-el text-el--empty' : 'text-el'}
      onDoubleClick={() => onChange({ editing: true })}
    >
      {isEmpty ? '' : element.text}
    </div>
  )
}

export default {
  key: 'text',
  onCreate() {
    return { text: '', editing: true }
  },
  Element: TextElement,
}

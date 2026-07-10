// Tool contract: onCreate(point) -> initial element data (x/y/id/type added by caller).
// Optional onDrag(element, point) -> patch, called while the mouse is held down after creation.
// Element({ element, onChange, onRemove }) renders the element's contents inside a positioned wrapper
// that the canvas scaffold already provides (drag-to-move, click-to-erase) — just render the visuals here.
import './noteTool.css'

function NoteElement({ element, onChange }) {
  const { text, editing } = element

  if (editing) {
    return (
      <div className="note-el">
        <textarea
          className="note-el__input"
          autoFocus
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          onBlur={() => onChange({ editing: false })}
        />
      </div>
    )
  }

  return (
    <div className="note-el" onDoubleClick={() => onChange({ editing: true })}>
      {text ? (
        <span className="note-el__text">{text}</span>
      ) : (
        <span className="note-el__placeholder">Double-click to edit</span>
      )}
    </div>
  )
}

export default {
  key: 'note',
  onCreate() {
    return { text: '', editing: true }
  },
  Element: NoteElement,
}

// Tool contract: onCreate(point) -> initial element data (x/y/id/type added by caller).
// Optional onDrag(element, point) -> patch, called while the mouse is held down after creation.
// Element({ element, onChange, onRemove }) renders the element's contents inside a positioned wrapper
// that the canvas scaffold already provides (drag-to-move, click-to-erase) — just render the visuals here.
import './commentTool.css'

function CommentElement({ element, onChange }) {
  const { comments = [], open, draft = '' } = element

  const handleAdd = () => {
    const text = draft.trim()
    if (!text) return
    onChange({ comments: [...comments, text], draft: '' })
  }

  return (
    <div className="comment-el">
      <button
        type="button"
        className="comment-el__pin"
        aria-label="Toggle comment thread"
        onClick={() => onChange({ open: !open })}
      >
        💬
      </button>

      {open && (
        <div
          className="comment-el__popover"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="comment-el__list">
            {comments.length === 0 ? (
              <div className="comment-el__empty">No comments yet</div>
            ) : (
              comments.map((c, i) => (
                <div className="comment-el__item" key={i}>
                  {c}
                </div>
              ))
            )}
          </div>
          <div className="comment-el__composer">
            <input
              type="text"
              className="comment-el__input"
              placeholder="Add a comment..."
              value={draft}
              onChange={(e) => onChange({ draft: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
            />
            <button
              type="button"
              className="comment-el__add"
              disabled={!draft.trim()}
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default {
  key: 'comment',
  onCreate() {
    return { comments: [], open: true, draft: '' }
  },
  Element: CommentElement,
}

// ponytail: hand-drawn inline SVGs, a whole icon library for a dozen glyphs is overkill.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const PointerIcon = () => (
  <svg {...base}><path d="M5 3l6 16 2-6 6-2z" /></svg>
)
export const FrameIcon = () => (
  <svg {...base}><path d="M4 7h16M7 4v16M3 17h18M17 3v18" /></svg>
)
export const TextIcon = () => (
  <svg {...base}><path d="M5 5h14M12 5v14" /></svg>
)
export const NoteIcon = () => (
  <svg {...base}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h5" /></svg>
)
export const ShapeIcon = () => (
  <svg {...base}><circle cx="9" cy="9" r="5" /><rect x="12" y="12" width="8" height="8" rx="1.5" /></svg>
)
export const PenIcon = () => (
  <svg {...base}><path d="M4 20l1-4L16 5l3 3L8 19z" /></svg>
)
export const CommentIcon = () => (
  <svg {...base}><path d="M4 5h16v11H9l-4 4z" /></svg>
)
export const EraserIcon = () => (
  <svg {...base}><path d="M4 15l9-9 6 6-9 9H8z" /><path d="M4 20h9" /></svg>
)
export const MoreIcon = () => (
  <svg {...base}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
)
export const ZoomOutIcon = () => (
  <svg {...base}><circle cx="10" cy="10" r="6" /><path d="M21 21l-5-5M8 10h4" /></svg>
)
export const ZoomInIcon = () => (
  <svg {...base}><circle cx="10" cy="10" r="6" /><path d="M21 21l-5-5M10 8v4M8 10h4" /></svg>
)
export const UndoIcon = () => (
  <svg {...base}><path d="M8 8H4V4" /><path d="M4 8c2-3 5-5 9-5 5 0 9 4 9 9s-4 9-9 9c-3 0-6-1.5-8-4" /></svg>
)
export const RedoIcon = () => (
  <svg {...base}><path d="M16 8h4V4" /><path d="M20 8c-2-3-5-5-9-5-5 0-9 4-9 9s4 9 9 9c3 0 6-1.5 8-4" /></svg>
)
export const MapIcon = () => (
  <svg {...base}><path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" /><path d="M9 4v14M15 6v14" /></svg>
)
export const SparkleIcon = () => (
  <svg {...base}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
)
export const ShareIcon = () => (
  <svg {...base}><circle cx="6" cy="12" r="2.2" /><circle cx="17" cy="6" r="2.2" /><circle cx="17" cy="18" r="2.2" /><path d="M8 11l7-4M8 13l7 4" /></svg>
)

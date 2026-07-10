import frameTool from './frameTool'
import textTool from './textTool'
import noteTool from './noteTool'
import shapeTool from './shapeTool'
import penTool from './penTool'
import commentTool from './commentTool'
import imageTool from './imageTool'

// ponytail: filled in as each tool module lands — keeps parallel tool-building
// agents from ever touching this file at the same time as each other.
export const TOOLS_REGISTRY = {
  frame: frameTool,
  text: textTool,
  note: noteTool,
  shape: shapeTool,
  pen: penTool,
  comment: commentTool,
  image: imageTool,
}

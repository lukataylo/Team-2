import './imageTool.css'

function ImageElement({ element }) {
  return <img className="image-el" src={element.src} alt="Uploaded" />
}

export default {
  key: 'image',
  Element: ImageElement,
}

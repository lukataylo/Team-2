// ponytail: node:http + a small mime map, a static file server for one SPA doesn't need a framework.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import generateVariants from './api/generate-variants.js'

const DIST = join(process.cwd(), 'dist')
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  if (req.url === '/api/generate-variants') {
    req.body = await readJsonBody(req).catch(() => ({}))
    await generateVariants(req, {
      status: (code) => ({
        json: (data) => {
          res.writeHead(code, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data))
        },
      }),
    })
    return
  }

  const filePath = join(DIST, req.url === '/' ? 'index.html' : req.url)
  try {
    const data = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    const data = await readFile(join(DIST, 'index.html'))
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  }
})

server.listen(process.env.PORT || 3000)

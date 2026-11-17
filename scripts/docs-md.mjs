// Genera docs/DOCUMENTACION.md a partir de la documentación del sistema.
// Uso: npm run docs
import { mkdirSync, writeFileSync } from 'node:fs'
import { documentacionAMarkdown } from '../src/modules/documentacion/markdown.js'

mkdirSync(new URL('../docs/', import.meta.url), { recursive: true })
const md = documentacionAMarkdown()
writeFileSync(new URL('../docs/DOCUMENTACION.md', import.meta.url), md)
console.log(`docs/DOCUMENTACION.md · ${md.split('\n').length} líneas`)

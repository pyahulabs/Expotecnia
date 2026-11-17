// Convierte la documentación (contenido.js) a Markdown. Sin dependencias de React:
// lo usan la página (botón «Descargar») y `scripts/docs-md.mjs` (npm run docs).
import { DOCUMENTACION, VERSION_DOCUMENTACION } from './contenido.js'

const celda = (texto) => String(texto).replace(/\|/g, '\\|')

const bloqueAMarkdown = (bloque) => {
  switch (bloque.t) {
    case 'p':
      return bloque.texto
    case 'h':
      return `### ${bloque.texto}`
    case 'lista':
      return bloque.items.map((item) => `- ${item}`).join('\n')
    case 'pasos':
      return bloque.items.map((item, i) => `${i + 1}. ${item}`).join('\n')
    case 'nota':
      return `> **${bloque.tono === 'aviso' ? 'Importante' : 'Nota'}:** ${bloque.texto}`
    case 'codigo':
      return '```\n' + bloque.texto + '\n```'
    case 'tabla':
      return [
        `| ${bloque.cols.map(celda).join(' | ')} |`,
        `| ${bloque.cols.map(() => '---').join(' | ')} |`,
        ...bloque.filas.map((fila) => `| ${fila.map(celda).join(' | ')} |`),
      ].join('\n')
    default:
      return ''
  }
}

export function documentacionAMarkdown(secciones = DOCUMENTACION) {
  const indice = secciones.map((s, i) => `${i + 1}. ${s.titulo}`).join('\n')
  const cuerpo = secciones
    .map((s, i) => [`## ${i + 1}. ${s.titulo}`, `*${s.resumen}*`, ...s.bloques.map(bloqueAMarkdown)].join('\n\n'))
    .join('\n\n---\n\n')
  return `# Arandu ERP · Documentación del sistema\n\nVersión ${VERSION_DOCUMENTACION}\n\n> Este archivo se genera con \`npm run docs\` a partir de \`src/modules/documentacion/contenido.js\`. No lo edites a mano.\n\n## Contenido\n\n${indice}\n\n---\n\n${cuerpo}\n`
}

// Arma un único archivo HTML con todo adentro (CSS, JS y fuentes) a partir de `dist-demo/`.
// Uso: npm run build:demo  →  dist-demo/arandu-erp.html
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = new URL('../dist-demo/', import.meta.url).pathname
const assets = readdirSync(join(dir, 'assets'))
const read = (ext) => assets.filter((f) => f.endsWith(ext)).map((f) => readFileSync(join(dir, 'assets', f), 'utf8')).join('\n')

if (assets.filter((f) => f.endsWith('.js')).length !== 1) throw new Error('Se esperaba un único archivo JS en dist-demo/assets')

// Dentro de <script> y <style> no pueden aparecer sus propias etiquetas de cierre
const js = read('.js').replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--')
const css = read('.css').replace(/<\/style/gi, '<\\/style')

const html = `<title>Arandu ERP</title>
<style>
${css}
/* Encabezados fijos por debajo de la barra del sistema en celulares */
.sticky.top-0 { top: env(safe-area-inset-top, 0px); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 45; background: var(--bg); }
</style>
<script>
  // Tema antes del primer render: elección guardada → tema del visor → tema del sistema
  (function () {
    var saved = null;
    try { saved = localStorage.getItem('erp.theme'); } catch (e) {}
    var attr = document.documentElement.getAttribute('data-theme');
    var dark = saved ? saved === 'dark' : attr ? attr === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  })();
</script>
<div id="root"></div>
<script type="module">
${js}
</script>
`

writeFileSync(join(dir, 'arandu-erp.html'), html)
console.log(`dist-demo/arandu-erp.html · ${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB`)

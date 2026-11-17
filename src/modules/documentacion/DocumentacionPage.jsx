import { Fragment, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Compass, Database, Download, FileText, FolderKanban, Info, Keyboard, Layers, LayoutDashboard, LifeBuoy, Network, Palette, Rocket, SearchX, ShieldCheck, Target, TriangleAlert, UserCog, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, EmptyState, SearchInput, toast } from '@/components/ui'
import { cn } from '@/lib/cn'
import { normalize } from '@/lib/format'
import { fadeUp, stagger } from '@/lib/motion'
import { DOCUMENTACION, VERSION_DOCUMENTACION } from './contenido'
import { documentacionAMarkdown } from './markdown'

// Solo los íconos que usa la documentación (importar toda la librería agrandaría mucho el archivo)
const Iconos = { BookOpen, Compass, Database, FileText, FolderKanban, Keyboard, Layers, LayoutDashboard, LifeBuoy, Network, Palette, Rocket, ShieldCheck, Target, UserCog, Users, Wallet }

/** `código` y **negrita** dentro de un texto. */
function Texto({ children }) {
  const partes = String(children).split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return partes.map((parte, i) => {
    if (parte.startsWith('`')) return <code key={i} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-fg">{parte.slice(1, -1)}</code>
    if (parte.startsWith('**')) return <strong key={i} className="font-semibold text-fg">{parte.slice(2, -2)}</strong>
    return <Fragment key={i}>{parte}</Fragment>
  })
}

function Bloque({ bloque }) {
  switch (bloque.t) {
    case 'p':
      return <p className="text-sm leading-7 text-fg-muted"><Texto>{bloque.texto}</Texto></p>
    case 'h':
      return <h3 className="pt-2 text-[15px] font-semibold tracking-[-0.01em] text-fg">{bloque.texto}</h3>
    case 'lista':
      return (
        <ul className="space-y-2">
          {bloque.items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-7 text-fg-muted">
              <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span><Texto>{item}</Texto></span>
            </li>
          ))}
        </ul>
      )
    case 'pasos':
      return (
        <ol className="space-y-2.5">
          {bloque.items.map((item, i) => (
            <li key={item} className="flex gap-3 text-sm leading-7 text-fg-muted">
              <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold tabular-nums text-primary-text" aria-hidden="true">{i + 1}</span>
              <span><Texto>{item}</Texto></span>
            </li>
          ))}
        </ol>
      )
    case 'nota': {
      const aviso = bloque.tono === 'aviso'
      const Icono = aviso ? TriangleAlert : Info
      return (
        <div className={cn('flex gap-3 rounded-xl px-4 py-3.5', aviso ? 'bg-warning-soft' : 'bg-info-soft')} role="note">
          <Icono size={17} className={cn('mt-1 shrink-0', aviso ? 'text-warning-text' : 'text-info-text')} aria-hidden="true" />
          <p className="text-[13px] leading-6 text-fg-muted"><Texto>{bloque.texto}</Texto></p>
        </div>
      )
    }
    case 'codigo':
      return (
        <pre className="overflow-x-auto rounded-xl border border-line bg-surface-2 p-4 font-mono text-[12.5px] leading-6 text-fg" tabIndex={0}>
          <code>{bloque.texto}</code>
        </pre>
      )
    case 'tabla':
      return (
        <div className="overflow-x-auto rounded-xl border border-line" tabIndex={0}>
          <table className="w-full min-w-[480px] border-collapse text-left text-[13px]">
            <thead className="bg-surface-2/70">
              <tr>
                {bloque.cols.map((col) => (
                  <th key={col} scope="col" className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {bloque.filas.map((fila, i) => (
                <tr key={i}>
                  {fila.map((celda, j) => (
                    <td key={j} className={cn('px-4 py-2.5 align-top leading-6', j === 0 ? 'font-medium text-fg' : 'text-fg-muted')}><Texto>{celda}</Texto></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

const textoDe = (seccion) =>
  [seccion.titulo, seccion.resumen, ...seccion.bloques.flatMap((b) => [b.texto, ...(b.items || []), ...(b.filas || []).flat(), ...(b.cols || [])])].filter(Boolean).join(' ')

/** Documentación del sistema: índice lateral, búsqueda y descarga en Markdown. */
export default function DocumentacionPage() {
  const [busqueda, setBusqueda] = useState('')
  const [activa, setActiva] = useState(DOCUMENTACION[0].id)

  const secciones = useMemo(() => {
    const q = normalize(busqueda.trim())
    return q ? DOCUMENTACION.filter((s) => normalize(textoDe(s)).includes(q)) : DOCUMENTACION
  }, [busqueda])

  // Resalta en el índice la sección que se está leyendo
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiva(visible.target.id)
      },
      { rootMargin: '-96px 0px -65% 0px' },
    )
    secciones.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [secciones])

  const ir = (id) => {
    setActiva(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const descargar = () => {
    try {
      const url = URL.createObjectURL(new Blob([documentacionAMarkdown()], { type: 'text/markdown;charset=utf-8' }))
      const enlace = Object.assign(document.createElement('a'), { href: url, download: 'DOCUMENTACION.md' })
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Documentación descargada', 'Se guardó DOCUMENTACION.md.')
    } catch {
      toast.error('No se pudo descargar', 'Probá desde la aplicación en el navegador.')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={`Ayuda · versión ${VERSION_DOCUMENTACION}`}
        title="Documentación del sistema"
        description="Guía de uso de cada módulo, usuarios y roles, datos, arquitectura técnica y solución de problemas."
        actions={
          import.meta.env.MODE !== 'demo' && (
            <Button variant="secondary" icon={Download} onClick={descargar}>
              Descargar .md
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
        {/* Índice */}
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Índice de la documentación">
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar en la guía…" />
          <nav className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:max-h-[calc(100dvh-14rem)] lg:flex-col lg:gap-0.5 lg:overflow-y-auto lg:px-0">
            {secciones.map((s) => {
              const Icono = Iconos[s.icono] || Iconos.FileText
              const esActiva = activa === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => ir(s.id)}
                  aria-current={esActiva ? 'true' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors lg:whitespace-normal',
                    esActiva ? 'bg-primary-soft text-primary-text' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  <Icono size={15} className="shrink-0" aria-hidden="true" />
                  {s.titulo}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Contenido */}
        <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="min-w-0 space-y-4 lg:space-y-6">
          {secciones.length === 0 ? (
            <Card>
              <EmptyState icon={SearchX} title="Sin resultados" description={`No hay secciones que mencionen «${busqueda}».`} action={<Button variant="secondary" onClick={() => setBusqueda('')}>Ver toda la documentación</Button>} />
            </Card>
          ) : (
            secciones.map((s) => {
              const Icono = Iconos[s.icono] || Iconos.FileText
              return (
                <Card key={s.id} variants={fadeUp} className="scroll-mt-24 p-5 sm:p-7" id={s.id} role="region" aria-labelledby={`${s.id}-titulo`}>
                  <header className="mb-5 flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-text">
                      <Icono size={19} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 id={`${s.id}-titulo`} className="text-lg font-semibold tracking-[-0.015em] text-fg">{s.titulo}</h2>
                      <p className="mt-0.5 text-[13px] leading-5 text-fg-subtle">{s.resumen}</p>
                    </div>
                  </header>
                  <div className="space-y-4">
                    {s.bloques.map((bloque, i) => (
                      <Bloque key={i} bloque={bloque} />
                    ))}
                  </div>
                </Card>
              )
            })
          )}
        </motion.div>
      </div>
    </>
  )
}

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Crosshair, Route } from 'lucide-react'
import { Avatar, Button, Tabs, Tooltip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { addDays, diffDays, formatDate, formatMonthLong, parseISODate, toISODate, todayISO } from '@/lib/format'
import { ease } from '@/lib/motion'

const ROW = 48 // alto de cada fila
const BAR = 26 // alto de la barra
const HEAD = 56 // alto del encabezado (meses + días)
const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

/** Camino SVG que pasa por los puntos dados, con las esquinas redondeadas. */
function caminoRedondeado(puntos, radio = 5) {
  let d = `M ${puntos[0][0]},${puntos[0][1]}`
  for (let i = 1; i < puntos.length - 1; i++) {
    const [px, py] = puntos[i - 1]
    const [cx, cy] = puntos[i]
    const [nx, ny] = puntos[i + 1]
    const d1 = Math.hypot(cx - px, cy - py)
    const d2 = Math.hypot(nx - cx, ny - cy)
    if (!d1 || !d2) continue
    const r = Math.min(radio, d1 / 2, d2 / 2)
    d += ` L ${cx - ((cx - px) / d1) * r},${cy - ((cy - py) / d1) * r} Q ${cx},${cy} ${cx + ((nx - cx) / d2) * r},${cy + ((ny - cy) / d2) * r}`
  }
  const ultimo = puntos[puntos.length - 1]
  return `${d} L ${ultimo[0]},${ultimo[1]}`
}

function Leyenda({ color, children, dashed }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-fg-muted">
      {dashed ? <span className="h-3.5 w-0.5 rounded-full" style={{ background: color }} aria-hidden="true" /> : <span className="h-2.5 w-5 rounded-[4px]" style={{ background: color }} aria-hidden="true" />}
      {children}
    </span>
  )
}

/**
 * Diagrama de Gantt propio (sin librerías): barras por fase con avance,
 * dependencias con flechas, ruta crítica resaltada y línea de "hoy".
 */
export function Gantt({ fases, ruta, onEdit }) {
  const markerId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const scroller = useRef(null)
  const [zoom, setZoom] = useState('completo')
  const [resaltar, setResaltar] = useState(true)
  const [ancho, setAncho] = useState(0)

  // Mide el ancho disponible para el zoom "Completo"
  useEffect(() => {
    const el = scroller.current
    if (!el) return undefined
    const observer = new ResizeObserver(([entry]) => setAncho(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const filas = useMemo(() => [...fases].sort((a, b) => (a.inicio === b.inicio ? (a.orden || 0) - (b.orden || 0) : a.inicio < b.inicio ? -1 : 1)), [fases])

  // Rango visible: de lunes a domingo, con algo de aire a cada lado
  const { desde, totalDias } = useMemo(() => {
    const inicio = addDays(ruta.inicio, -3)
    inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7))
    const fin = addDays(ruta.fin, 5)
    fin.setDate(fin.getDate() + ((7 - fin.getDay()) % 7))
    return { desde: inicio, totalDias: diffDays(inicio, fin) + 1 }
  }, [ruta.inicio, ruta.fin])

  const diaW = zoom === 'dias' ? 36 : zoom === 'semanas' ? 22 : Math.max(7, (ancho || 800) / totalDias)
  const anchoTotal = totalDias * diaW
  const x = (fecha) => diffDays(desde, fecha) * diaW
  const hoy = todayISO()
  const hoyX = x(hoy) + diaW / 2
  const hoyVisible = diffDays(desde, hoy) >= 0 && diffDays(desde, hoy) < totalDias

  const dias = useMemo(() => Array.from({ length: totalDias }, (_, i) => addDays(desde, i)), [desde, totalDias])
  const meses = useMemo(() => {
    const grupos = []
    dias.forEach((fecha, i) => {
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`
      const ultimo = grupos[grupos.length - 1]
      if (ultimo?.clave === clave) ultimo.dias += 1
      else grupos.push({ clave, fecha, inicio: i, dias: 1 })
    })
    return grupos
  }, [dias])

  const irAHoy = (suave = true) => {
    const el = scroller.current
    if (el) el.scrollTo({ left: Math.max(0, hoyX - el.clientWidth / 2), behavior: suave ? 'smooth' : 'auto' })
  }

  // Al cambiar el zoom, centra la vista en hoy
  useEffect(() => {
    const frame = requestAnimationFrame(() => irAHoy(false))
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, diaW])

  const indice = new Map(filas.map((f, i) => [f.id, i]))
  const centroY = (i) => i * ROW + ROW / 2

  // Flechas de dependencia: del final de la fase previa al inicio de la siguiente
  const enlaces = filas.flatMap((fase) =>
    (fase.dependencias || [])
      .filter((depId) => indice.has(depId))
      .map((depId) => {
        const previa = filas[indice.get(depId)]
        const x1 = x(previa.fin) + diaW - 1
        const y1 = centroY(indice.get(depId))
        const x2 = x(fase.inicio) - 1
        const y2 = centroY(indice.get(fase.id))
        const sentido = y2 > y1 ? 1 : -1
        const puntos =
          x2 - x1 >= 22
            ? [[x1, y1], [x1 + 10, y1], [x1 + 10, y2], [x2, y2]]
            : [[x1, y1], [x1 + 10, y1], [x1 + 10, y1 + (sentido * ROW) / 2], [x2 - 12, y1 + (sentido * ROW) / 2], [x2 - 12, y2], [x2, y2]]
        const critico = ruta.enlacesCriticos.has(`${depId}>${fase.id}`)
        return { id: `${depId}>${fase.id}`, d: caminoRedondeado(puntos), critico }
      }),
  )

  return (
    <div>
      {/* Barra de herramientas */}
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Leyenda color="var(--chart-3)">Ruta crítica</Leyenda>
          <Leyenda color="var(--primary)">Fase con holgura</Leyenda>
          <Leyenda color="var(--primary)" dashed>
            Hoy
          </Leyenda>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={resaltar}
            onClick={() => setResaltar((v) => !v)}
            className="flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Route size={15} aria-hidden="true" />
            Resaltar ruta crítica
            <span className={cn('relative h-5 w-9 rounded-full transition-colors duration-200', resaltar ? 'bg-primary' : 'bg-surface-3')}>
              <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow', resaltar ? 'right-0.5' : 'left-0.5')} />
            </span>
          </button>
          <Tabs
            variant="pill"
            label="Zoom del diagrama"
            value={zoom}
            onChange={setZoom}
            tabs={[
              { id: 'completo', label: 'Completo' },
              { id: 'semanas', label: 'Semanas' },
              { id: 'dias', label: 'Días' },
            ]}
          />
          <Button variant="secondary" size="sm" icon={Crosshair} onClick={() => irAHoy()}>
            Hoy
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Columna fija con los nombres */}
        <div className="w-36 shrink-0 border-r border-line sm:w-56 lg:w-72">
          <div className="flex items-end border-b border-line px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-subtle sm:px-5" style={{ height: HEAD }}>
            Fase
          </div>
          <ul>
            {filas.map((fase) => {
              const critica = ruta.criticas.has(fase.id)
              return (
                <li key={fase.id} style={{ height: ROW }} className="border-b border-line last:border-b-0">
                  <button type="button" onClick={() => onEdit(fase)} className="flex size-full items-center gap-3 px-4 text-left transition-colors hover:bg-surface-2/70 sm:px-5" aria-label={`Editar fase ${fase.nombre}`}>
                    <span className={cn('size-2 shrink-0 rounded-full')} style={{ background: critica ? 'var(--chart-3)' : 'var(--primary)' }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-fg">{fase.nombre}</span>
                      <span className="hidden truncate text-[11px] text-fg-subtle sm:block">
                        {formatDate(fase.inicio)} → {formatDate(fase.fin)} · {diffDays(fase.inicio, fase.fin) + 1} d
                      </span>
                    </span>
                    <Avatar name={fase.responsable || 'Sin asignar'} size="xs" className="hidden lg:inline-grid" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Línea de tiempo (scroll horizontal) */}
        <div ref={scroller} className="min-w-0 flex-1 overflow-x-auto" tabIndex={0} role="region" aria-label="Línea de tiempo del proyecto. Usá las flechas para desplazarte.">
          <div className="relative" style={{ width: anchoTotal }}>
            {/* Encabezado: meses y días */}
            <div className="relative border-b border-line" style={{ height: HEAD }}>
              {meses.map((mes) => (
                <div key={mes.clave} className="absolute top-0 flex h-7 items-center border-l border-line px-2 first:border-l-0" style={{ left: mes.inicio * diaW, width: mes.dias * diaW }}>
                  <span className="sticky left-2 truncate text-xs font-semibold text-fg">{mes.dias * diaW > 70 ? formatMonthLong(mes.fecha) : ''}</span>
                </div>
              ))}
              {dias.map((fecha, i) => {
                const lunes = fecha.getDay() === 1
                const mostrar = diaW >= 18 || lunes
                if (!mostrar) return null
                const esHoy = toISODate(fecha) === hoy
                return (
                  <div
                    key={i}
                    className={cn('absolute bottom-0 flex h-7 flex-col items-center justify-center text-[10px] leading-none', esHoy ? 'font-bold text-primary-text' : 'text-fg-subtle')}
                    style={{ left: i * diaW, width: diaW >= 18 ? diaW : diaW * 7, alignItems: diaW >= 18 ? 'center' : 'flex-start', paddingLeft: diaW >= 18 ? 0 : 3 }}
                  >
                    {diaW >= 30 && <span className="mb-0.5 opacity-70">{DIAS[fecha.getDay()]}</span>}
                    <span className="tabular-nums">{fecha.getDate()}</span>
                  </div>
                )
              })}
            </div>

            {/* Cuerpo */}
            <div className="relative" style={{ height: filas.length * ROW }}>
              {/* Fines de semana y divisiones de semana */}
              {dias.map((fecha, i) => {
                const finde = fecha.getDay() === 0 || fecha.getDay() === 6
                const lunes = fecha.getDay() === 1
                if (!finde && !lunes) return null
                return <div key={i} aria-hidden="true" className={cn('absolute inset-y-0', finde && 'bg-surface-2/70', lunes && 'border-l border-line')} style={{ left: i * diaW, width: diaW }} />
              })}
              {filas.map((fase, i) => (
                <div key={fase.id} aria-hidden="true" className="absolute inset-x-0 border-b border-line last:border-b-0" style={{ top: i * ROW, height: ROW }} />
              ))}

              {/* Dependencias */}
              <svg className="pointer-events-none absolute inset-0 overflow-visible" width={anchoTotal} height={filas.length * ROW} aria-hidden="true">
                <defs>
                  <marker id={`${markerId}-n`} markerWidth="7" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                    <path d="M0,0.5 L7,4 L0,7.5 Z" fill="var(--fg-subtle)" />
                  </marker>
                  <marker id={`${markerId}-c`} markerWidth="8" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
                    <path d="M0,0.5 L8,4.5 L0,8.5 Z" fill="var(--chart-3)" />
                  </marker>
                </defs>
                {enlaces.map((enlace, i) => {
                  const destacado = resaltar && enlace.critico
                  return (
                    <motion.path
                      key={`${enlace.id}-${diaW}`}
                      d={enlace.d}
                      fill="none"
                      stroke={destacado ? 'var(--chart-3)' : 'var(--fg-subtle)'}
                      strokeWidth={destacado ? 2 : 1.5}
                      strokeLinecap="round"
                      markerEnd={`url(#${markerId}-${destacado ? 'c' : 'n'})`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: resaltar && !enlace.critico ? 0.35 : destacado ? 1 : 0.7 }}
                      transition={{ duration: 0.6, delay: 0.35 + i * 0.04, ease }}
                    />
                  )
                })}
              </svg>

              {/* Barras */}
              {filas.map((fase, i) => {
                const critica = ruta.criticas.has(fase.id)
                const destacada = resaltar && critica
                const color = destacada ? 'var(--chart-3)' : 'var(--primary)'
                const duracion = diffDays(fase.inicio, fase.fin) + 1
                const avance = Math.min(100, Math.max(0, Number(fase.avance) || 0))
                const holgura = ruta.holguras.get(fase.id) ?? 0
                const anchoBarra = Math.max(6, duracion * diaW - 2)
                return (
                  <Tooltip
                    key={fase.id}
                    side="top"
                    className="absolute block"
                    style={{ left: x(fase.inicio) + 1, top: i * ROW + (ROW - BAR) / 2, width: anchoBarra, height: BAR }}
                    content={
                      <span className="block space-y-0.5 py-0.5 text-left">
                        <span className="block text-[13px] font-semibold">{fase.nombre}</span>
                        <span className="block opacity-80">
                          {formatDate(fase.inicio)} → {formatDate(fase.fin)} · {duracion} {duracion === 1 ? 'día' : 'días'}
                        </span>
                        <span className="block opacity-80">
                          Avance {avance}% · {critica ? 'Ruta crítica (sin holgura)' : `Holgura de ${holgura} ${holgura === 1 ? 'día' : 'días'}`}
                        </span>
                      </span>
                    }
                  >
                    <motion.button
                      type="button"
                      onClick={() => onEdit(fase)}
                      aria-label={`${fase.nombre}: del ${formatDate(fase.inicio)} al ${formatDate(fase.fin)}, avance ${avance}%${critica ? ', ruta crítica' : ''}`}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: resaltar && !critica ? 0.65 : 1 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.5, delay: 0.08 + i * 0.045, ease }}
                      style={{ originX: 0, background: `color-mix(in srgb, ${color} 26%, var(--surface))`, boxShadow: destacada ? `0 4px 14px -4px ${color}` : undefined }}
                      className="relative size-full overflow-hidden rounded-lg"
                    >
                      <motion.span
                        className="absolute inset-y-0 left-0 rounded-lg"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${avance}%` }}
                        transition={{ duration: 0.7, delay: 0.4 + i * 0.045, ease }}
                      />
                      {anchoBarra > 54 && (
                        <span className="absolute inset-y-0 right-1 flex items-center">
                          <span className="rounded-md bg-surface/90 px-1 text-[10px] font-bold leading-4 tabular-nums text-fg">{avance}%</span>
                        </span>
                      )}
                    </motion.button>
                  </Tooltip>
                )
              })}

              {/* Línea de hoy */}
              {hoyVisible && (
                <div className="pointer-events-none absolute -top-7 bottom-0 z-10" style={{ left: hoyX }} aria-hidden="true">
                  <span className="absolute left-1/2 top-0 flex h-5 -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-raised">
                    <CalendarDays size={10} />
                    Hoy
                  </span>
                  <motion.span
                    className="absolute bottom-0 left-1/2 top-5 w-0.5 -translate-x-1/2 origin-top rounded-full bg-primary"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

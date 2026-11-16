// Ruta crítica (CPM) calculada a partir de las fechas y dependencias de las fases.
//
// Para cada fase se calcula su HOLGURA TOTAL: cuántos días puede atrasarse sin
// mover la fecha de fin del proyecto.
//   · sin sucesoras:  holgura = finProyecto − finFase
//   · con sucesoras:  holgura = mínimo de (inicioSucesora − finFase − 1 + holguraSucesora)
// Una fase es CRÍTICA cuando su holgura es 0: cualquier atraso retrasa todo el proyecto.

import { diffDays } from '@/lib/format'

export function calcularRutaCritica(fases) {
  if (!fases.length) return { holguras: new Map(), criticas: new Set(), enlacesCriticos: new Set(), inicio: null, fin: null }

  const inicio = fases.reduce((min, f) => (f.inicio < min ? f.inicio : min), fases[0].inicio)
  const fin = fases.reduce((max, f) => (f.fin > max ? f.fin : max), fases[0].fin)
  const dia = (fecha) => diffDays(inicio, fecha)
  const finProyecto = dia(fin)

  const porId = new Map(fases.map((f) => [f.id, f]))
  const sucesoras = new Map()
  fases.forEach((f) => {
    ;(f.dependencias || []).forEach((depId) => {
      if (!porId.has(depId)) return
      if (!sucesoras.has(depId)) sucesoras.set(depId, [])
      sucesoras.get(depId).push(f)
    })
  })

  const holguras = new Map()
  const visitando = new Set()
  const holguraDe = (fase) => {
    if (holguras.has(fase.id)) return holguras.get(fase.id)
    if (visitando.has(fase.id)) return 0 // dependencia circular: se corta
    visitando.add(fase.id)
    let holgura = finProyecto - dia(fase.fin)
    ;(sucesoras.get(fase.id) || []).forEach((s) => {
      holgura = Math.min(holgura, dia(s.inicio) - dia(fase.fin) - 1 + holguraDe(s))
    })
    visitando.delete(fase.id)
    holguras.set(fase.id, holgura)
    return holgura
  }
  fases.forEach(holguraDe)

  const criticas = new Set(fases.filter((f) => holguras.get(f.id) <= 0).map((f) => f.id))

  // Un enlace es crítico si une dos fases críticas sin días libres entre ellas
  const enlacesCriticos = new Set()
  fases.forEach((f) => {
    ;(f.dependencias || []).forEach((depId) => {
      const previa = porId.get(depId)
      if (previa && criticas.has(f.id) && criticas.has(depId) && dia(f.inicio) - dia(previa.fin) - 1 <= 0) enlacesCriticos.add(`${depId}>${f.id}`)
    })
  })

  return { holguras, criticas, enlacesCriticos, inicio, fin }
}

/** ¿`a` depende (directa o indirectamente) de `b`? Sirve para evitar ciclos al editar. */
export function dependeDe(fases, a, b, vistos = new Set()) {
  if (a === b) return true
  if (vistos.has(a)) return false
  vistos.add(a)
  const fase = fases.find((f) => f.id === a)
  return (fase?.dependencias || []).some((dep) => dependeDe(fases, dep, b, vistos))
}

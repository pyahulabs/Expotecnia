// Helpers de formato: moneda en Guaraníes, fechas en español, iniciales, etc.

const nf = new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('es-PY', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export const formatNumber = (n) => nf.format(Math.round(Number(n) || 0))
export const formatDecimal = (n) => nf1.format(Number(n) || 0)
export const formatPercent = (n, decimals = 0) =>
  `${new Intl.NumberFormat('es-PY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(n) || 0)}%`

/** Gs. 1.250.000.000 */
export const formatGs = (n) => {
  const value = Math.round(Number(n) || 0)
  return `${value < 0 ? '−' : ''}Gs. ${nf.format(Math.abs(value))}`
}

/** Versión corta para ejes y tarjetas: Gs. 1.250 M */
export const formatGsCompact = (n, withPrefix = true) => {
  const value = Number(n) || 0
  const abs = Math.abs(value)
  const sign = value < 0 ? '−' : ''
  const prefix = withPrefix ? 'Gs. ' : ''
  if (abs >= 1e6) {
    const millions = abs / 1e6
    const text = millions >= 100 ? nf.format(millions) : nf1.format(millions).replace(',0', '')
    return `${sign}${prefix}${text} M`
  }
  if (abs >= 1e3) return `${sign}${prefix}${nf.format(abs / 1e3)} mil`
  return `${sign}${prefix}${nf.format(abs)}`
}

/** Convierte "1.250.000" o "Gs. 1.250.000" a número. */
export const parseGs = (text) => Number(String(text ?? '').replace(/[^\d-]/g, '')) || 0

// ---- Fechas ---------------------------------------------------------------
const DAY = 86_400_000

/** Date local a "YYYY-MM-DD" (sin corrimiento por zona horaria). */
export const toISODate = (date) => {
  const d = new Date(date)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** "YYYY-MM-DD" a Date local a medianoche. */
export const parseISODate = (iso) => {
  if (iso instanceof Date) return new Date(iso.getFullYear(), iso.getMonth(), iso.getDate())
  const [y, m, d] = String(iso || '').slice(0, 10).split('-').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1)
}

export const addDays = (date, days) => {
  const d = parseISODate(date)
  d.setDate(d.getDate() + days)
  return d
}

export const diffDays = (a, b) => Math.round((parseISODate(b) - parseISODate(a)) / DAY)

export const todayISO = () => toISODate(new Date())

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const dfLong = new Intl.DateTimeFormat('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })
const dfMonthLong = new Intl.DateTimeFormat('es-PY', { month: 'long', year: 'numeric' })

export const formatDate = (iso) => {
  if (!iso) return '—'
  const d = parseISODate(iso)
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()].toLowerCase()}`
}
/** 19 feb 2018 */
export const formatDateYear = (iso) => (iso ? `${formatDate(iso)} ${parseISODate(iso).getFullYear()}` : '—')
export const formatDateLong = (iso) => (iso ? dfLong.format(parseISODate(iso)) : '—')
export const formatMonth = (date) => MESES_CORTOS[new Date(date).getMonth()]
export const formatMonthLong = (date) => {
  const s = dfMonthLong.format(date)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** "hace 5 min", "hace 2 h", "ayer"… */
export const timeAgo = (timestamp, now = Date.now()) => {
  const diff = Math.max(0, now - Number(timestamp || 0))
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days} días`
  return formatDate(new Date(Number(timestamp)))
}

// ---- Texto ----------------------------------------------------------------
export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((_, i, arr) => i === 0 || i === arr.length - 1 || arr.length <= 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

/** Matiz (0-359) estable a partir de un texto: se usa para el color del avatar. */
export const hueFromString = (text = '') => {
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  const hues = [250, 212, 168, 142, 28, 345, 290, 190, 48, 320]
  return hues[hash % hues.length]
}

/** Quita acentos y pasa a minúsculas para comparar búsquedas. */
export const normalize = (text = '') =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export const average = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0)
export const sum = (list) => list.reduce((a, b) => a + (Number(b) || 0), 0)
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

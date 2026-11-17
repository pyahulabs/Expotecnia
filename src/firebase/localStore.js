// "Mini Firestore" local: guarda las colecciones en localStorage y avisa los
// cambios en tiempo real (también entre pestañas, con BroadcastChannel).
// Se usa SOLO cuando no hay .env de Firebase, para que la app funcione igual.

const PREFIX = 'erp.db.'
const LATENCY = 450 // ms: simula la primera carga para que se vean los skeletons

const memory = new Map() // nombre de colección → array de documentos
const listeners = new Map() // nombre de colección → Set de callbacks
let channel = null
try {
  channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('erp-local-db') : null
} catch {
  /* contexto sin permiso para BroadcastChannel: no hay sincronización entre pestañas */
}

const read = (name) => {
  if (!memory.has(name)) {
    try {
      memory.set(name, JSON.parse(localStorage.getItem(PREFIX + name)) || [])
    } catch {
      memory.set(name, [])
    }
  }
  return memory.get(name)
}

const emit = (name) => listeners.get(name)?.forEach((callback) => callback(read(name)))

const write = (name, docs) => {
  memory.set(name, docs)
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(docs))
  } catch {
    /* sin espacio o modo privado: queda solo en memoria */
  }
  emit(name)
  channel?.postMessage(name)
}

if (channel) {
  channel.onmessage = (event) => {
    memory.delete(event.data)
    emit(event.data)
  }
}

const randomId = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36)

export const localStore = {
  subscribe(name, onData) {
    if (!listeners.has(name)) listeners.set(name, new Set())
    const timer = setTimeout(() => {
      listeners.get(name).add(onData)
      onData(read(name))
    }, LATENCY)
    return () => {
      clearTimeout(timer)
      listeners.get(name)?.delete(onData)
    }
  },
  newId: randomId,
  async set(name, id, data) {
    const docs = read(name)
    const exists = docs.some((d) => d.id === id)
    write(name, exists ? docs.map((d) => (d.id === id ? { id, ...data } : d)) : [...docs, { id, ...data }])
  },
  async update(name, id, patch) {
    write(name, read(name).map((d) => (d.id === id ? { ...d, ...patch } : d)))
  },
  async remove(name, id) {
    write(name, read(name).filter((d) => d.id !== id))
  },
  async setMany(items) {
    const byCollection = new Map()
    items.forEach(({ name, id, data }) => {
      if (!byCollection.has(name)) byCollection.set(name, new Map(read(name).map((d) => [d.id, d])))
      byCollection.get(name).set(id, { id, ...data })
    })
    byCollection.forEach((docs, name) => write(name, [...docs.values()]))
  },
  async clear(names) {
    names.forEach((name) => write(name, []))
  },
}

// Marca para sembrar los datos de demo una sola vez en modo local.
const SEEDED_KEY = `${PREFIX}__seeded`
export const wasSeeded = () => {
  try {
    return localStorage.getItem(SEEDED_KEY) === '1'
  } catch {
    return false // sin almacenamiento: se cargan los datos de demo en memoria
  }
}
const BASE_KEY = `${PREFIX}__base`
export const baseWasSeeded = () => {
  try {
    return localStorage.getItem(BASE_KEY) === '1'
  } catch {
    return false
  }
}
export const markBaseSeeded = () => {
  try {
    localStorage.setItem(BASE_KEY, '1')
  } catch {
    /* noop */
  }
}
export const markSeeded = () => {
  try {
    localStorage.setItem(SEEDED_KEY, '1')
  } catch {
    /* noop */
  }
}

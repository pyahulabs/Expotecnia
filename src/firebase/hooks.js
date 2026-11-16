// Capa de datos del ERP.
//
//   const { data, loading, error, add, update, remove } = useCollection('empleados')
//
// - Con Firebase configurado (.env): usa Firestore con onSnapshot → tiempo real.
// - Sin .env: usa un almacén local con la misma interfaz (modo demo).
//
// Las escrituras son "optimistas": la pantalla se actualiza al instante (Firestore
// aplica el cambio en su caché local y onSnapshot lo emite). Si el servidor rechaza
// la escritura, se avisa por `onDataError` y la app muestra un toast.

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { localStore } from './localStore'
import { COLECCIONES } from '@/config/constants'
import { getCurrentUserName } from '@/context/SessionContext'

/** 'firestore' | 'local' */
export const dataMode = isFirebaseConfigured ? 'firestore' : 'local'

// ---------------------------------------------------------------------------
// Backend: Firestore
// ---------------------------------------------------------------------------
const chunk = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size))

// ---------------------------------------------------------------------------
// Estado de la conexión (lo muestra el sidebar)
//   local → sin .env · conectando → esperando al servidor · vivo → sincronizado
//   cache → sin internet, mostrando la copia guardada · error → Firestore rechazó la lectura
// ---------------------------------------------------------------------------
let connection = isFirebaseConfigured ? 'conectando' : 'local'
const connectionListeners = new Set()
const setConnection = (next) => {
  if (next === connection) return
  connection = next
  connectionListeners.forEach((notify) => notify())
}
const subscribeConnection = (notify) => {
  connectionListeners.add(notify)
  return () => connectionListeners.delete(notify)
}
/** @returns {'local' | 'conectando' | 'vivo' | 'cache' | 'error'} */
export const useConnectionStatus = () => useSyncExternalStore(subscribeConnection, () => connection)

const firestoreStore = {
  subscribe(name, onData, onError) {
    return onSnapshot(
      collection(db, name),
      { includeMetadataChanges: true }, // avisa también cuando se pasa de caché a servidor
      (snapshot) => {
        setConnection(snapshot.metadata.fromCache ? 'cache' : 'vivo')
        onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      },
      (error) => {
        setConnection('error')
        onError(error)
      },
    )
  },
  newId: (name) => doc(collection(db, name)).id,
  set: (name, id, data) => setDoc(doc(db, name, id), data),
  update: (name, id, patch) => updateDoc(doc(db, name, id), patch),
  remove: (name, id) => deleteDoc(doc(db, name, id)),
  async setMany(items) {
    for (const group of chunk(items, 400)) {
      const batch = writeBatch(db)
      group.forEach(({ name, id, data }) => batch.set(doc(db, name, id), data))
      await batch.commit()
    }
  },
  async clear(names) {
    for (const name of names) {
      const snapshot = await getDocs(collection(db, name))
      for (const group of chunk(snapshot.docs, 400)) {
        const batch = writeBatch(db)
        group.forEach((d) => batch.delete(d.ref))
        await batch.commit()
      }
    }
  },
}

const backend = isFirebaseConfigured ? firestoreStore : localStore

// ---------------------------------------------------------------------------
// Errores: canal global para mostrar toasts desde un solo lugar (ver App.jsx)
// ---------------------------------------------------------------------------
const errorListeners = new Set()
export const onDataError = (listener) => {
  errorListeners.add(listener)
  return () => errorListeners.delete(listener)
}
const reportError = (error, context) => {
  console.error('[datos]', context, error)
  errorListeners.forEach((listener) => listener(error, context))
}

/** Traduce los errores más comunes de Firestore a un mensaje entendible. */
export const describeError = (error) => {
  const code = error?.code || ''
  if (code.includes('permission-denied')) return 'Firestore rechazó la operación. Revisá que las reglas estén en modo de prueba.'
  if (code.includes('unavailable') || error?.message === 'timeout') return 'No se pudo conectar con Firestore. Revisá tu conexión a internet.'
  if (code.includes('not-found')) return 'El documento ya no existe.'
  return error?.message || 'Ocurrió un error inesperado.'
}

const withTimeout = (promise, ms = 10_000) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])

// Firestore no acepta `undefined`: se limpia el objeto antes de guardar.
const clean = (data) => JSON.parse(JSON.stringify(data))

// ---------------------------------------------------------------------------
// Suscripciones compartidas: un solo onSnapshot por colección para toda la app
// ---------------------------------------------------------------------------
const stores = new Map()

function createStore(name) {
  let state = { data: [], loading: true, error: null }
  const subscribers = new Set()
  let started = false

  const setState = (next) => {
    state = next
    subscribers.forEach((notify) => notify())
  }

  const start = () => {
    started = true
    backend.subscribe(
      name,
      (docs) => setState({ data: docs, loading: false, error: null }),
      (error) => {
        setState({ ...state, loading: false, error })
        reportError(error, { op: 'leer', name })
      },
    )
    // Sin internet y sin caché, Firestore puede quedarse esperando: a los 10 s se deja
    // de mostrar "cargando" (la suscripción sigue viva y se actualiza sola al reconectar).
    setTimeout(() => {
      if (!state.loading) return
      setState({ ...state, loading: false })
      setConnection('cache')
      reportError(new Error('timeout'), { op: 'leer', name })
    }, 10_000)
  }

  return {
    subscribe(notify) {
      subscribers.add(notify)
      if (!started) start()
      return () => subscribers.delete(notify)
    },
    getSnapshot: () => state,
  }
}

const getStore = (name) => {
  if (!stores.has(name)) stores.set(name, createStore(name))
  return stores.get(name)
}

// ---------------------------------------------------------------------------
// Escrituras (se pueden usar fuera de componentes)
// ---------------------------------------------------------------------------

/** Crea un documento y devuelve su id al instante. */
export function addItem(name, data) {
  const id = backend.newId(name)
  const payload = clean({ ...data, createdAt: data.createdAt ?? Date.now() })
  backend.set(name, id, payload).catch((error) => reportError(error, { op: 'crear', name }))
  return id
}

export function updateItem(name, id, patch) {
  return backend
    .update(name, id, clean({ ...patch, updatedAt: Date.now() }))
    .catch((error) => reportError(error, { op: 'actualizar', name }))
}

export function removeItem(name, id) {
  return backend.remove(name, id).catch((error) => reportError(error, { op: 'eliminar', name }))
}

/** Escribe muchos documentos de una vez (seed). items: [{ name, id, data }] */
export const setMany = (items) => withTimeout(backend.setMany(items.map((item) => ({ ...item, data: clean(item.data) }))), 20_000)

/** Borra todos los documentos de las colecciones indicadas. */
export const clearCollections = (names) => withTimeout(backend.clear(names), 20_000)

/** Registra un evento en el feed "Actividad reciente" del dashboard. */
export function logActivity(modulo, mensaje, tipo = 'editar') {
  addItem(COLECCIONES.actividad, { modulo, mensaje, tipo, usuario: getCurrentUserName() })
}

/** Botón "Probar conexión": escribe un documento en test_collection y espera la confirmación. */
export async function testConnection() {
  const id = backend.newId(COLECCIONES.test)
  const payload = {
    mensaje: 'Prueba de conexión desde Arandu ERP',
    usuario: getCurrentUserName(),
    fecha: new Date().toISOString(),
    createdAt: Date.now(),
  }
  await withTimeout(backend.set(COLECCIONES.test, id, payload), 8_000)
  return { id, mode: dataMode }
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------
const compare = (a, b) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'es', { numeric: true })
}

/**
 * Escucha una colección en tiempo real.
 * @param {string} name     Nombre de la colección.
 * @param {object} options  { orderBy = 'createdAt', direction = 'asc' | 'desc' }
 * @returns {{ data: object[], loading: boolean, error: Error|null, add, update, remove }}
 */
export function useCollection(name, { orderBy = 'createdAt', direction = 'asc' } = {}) {
  const store = getStore(name)
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)

  const data = useMemo(() => {
    const sorted = [...state.data].sort((a, b) => compare(a[orderBy], b[orderBy]))
    return direction === 'desc' ? sorted.reverse() : sorted
  }, [state.data, orderBy, direction])

  const add = useCallback((values) => addItem(name, values), [name])
  const update = useCallback((id, patch) => updateItem(name, id, patch), [name])
  const remove = useCallback((id) => removeItem(name, id), [name])

  return { data, loading: state.loading, error: state.error, add, update, remove }
}

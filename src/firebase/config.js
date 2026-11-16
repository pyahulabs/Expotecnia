// Configuración de Firebase. Los valores salen del archivo .env (ver .env.example).
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** true cuando el .env tiene los datos mínimos para conectarse. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)

export const projectId = firebaseConfig.projectId || null

let app = null
let db = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  try {
    // Caché persistente: si se corta el wifi (¡feria!), la app sigue mostrando los últimos datos.
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  } catch {
    db = getFirestore(app)
  }
} else if (import.meta.env.DEV) {
  console.info(
    '%c[Arandu ERP] Firebase no está configurado → modo local.%c\nCopiá .env.example a .env y completá los valores para usar Firestore.',
    'font-weight:bold;color:#5b4ff5',
    'color:inherit',
  )
}

export { app, db }

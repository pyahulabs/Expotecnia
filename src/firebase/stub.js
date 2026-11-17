// Reemplazo vacío de Firebase para el build "demo" (un solo HTML sin conexión a servicios).
// En ese build la app siempre usa el almacén local, así que estas funciones nunca se llaman.
const noop = () => null
export const initializeApp = noop
export const getFirestore = noop
export const initializeFirestore = noop
export const persistentLocalCache = noop
export const persistentMultipleTabManager = noop
export const collection = noop
export const doc = noop
export const onSnapshot = () => () => {}
export const setDoc = async () => {}
export const updateDoc = async () => {}
export const deleteDoc = async () => {}
export const getDocs = async () => ({ docs: [] })
export const writeBatch = () => ({ set: noop, delete: noop, commit: async () => {} })

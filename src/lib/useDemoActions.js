import { useCallback, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { dataMode, describeError, logActivity, testConnection } from '@/firebase/hooks'
import { clearDemoData, seedDemoData } from '@/firebase/seed'
import { projectId } from '@/firebase/config'

/** Acciones de demo compartidas (dashboard, menú de usuario y buscador). */
export function useDemoActions() {
  const [seeding, setSeeding] = useState(false)
  const [testing, setTesting] = useState(false)
  const [clearing, setClearing] = useState(false)

  const seed = useCallback(async () => {
    setSeeding(true)
    try {
      const total = await seedDemoData()
      logActivity('Sistema', 'cargó los datos de demostración', 'sistema')
      toast.success('Datos de demo cargados', `${total} documentos sincronizados en todos los módulos.`)
    } catch (error) {
      toast.error('No se pudieron cargar los datos', describeError(error))
    } finally {
      setSeeding(false)
    }
  }, [])

  const test = useCallback(async () => {
    setTesting(true)
    try {
      const result = await testConnection()
      if (result.mode === 'firestore') {
        toast.success('Conexión con Firestore correcta', `Se escribió el documento ${result.id} en test_collection (${projectId}).`)
      } else {
        toast.info('Modo local activo', 'La prueba se guardó en el navegador. Completá el archivo .env para conectar Firestore.')
      }
    } catch (error) {
      toast.error('Falló la prueba de conexión', describeError(error))
    } finally {
      setTesting(false)
    }
  }, [])

  const clear = useCallback(async () => {
    setClearing(true)
    try {
      await clearDemoData()
      toast.success('Datos eliminados', 'Las colecciones del ERP quedaron vacías.')
    } catch (error) {
      toast.error('No se pudieron eliminar los datos', describeError(error))
    } finally {
      setClearing(false)
    }
  }, [])

  return { seed, seeding, test, testing, clear, clearing, dataMode }
}

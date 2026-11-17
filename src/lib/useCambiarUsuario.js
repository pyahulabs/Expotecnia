import { useCallback } from 'react'
import { toast } from '@/components/ui/Toast'
import { COLECCIONES } from '@/config/constants'
import { useSession } from '@/context/SessionContext'
import { updateItem } from '@/firebase/hooks'

/** Cambia la sesión a otro usuario de la colección `usuarios` y registra su último acceso. */
export function useCambiarUsuario({ silencioso = false } = {}) {
  const { switchUser } = useSession()
  return useCallback(
    (usuario) => {
      switchUser(usuario)
      updateItem(COLECCIONES.usuarios, usuario.id, { ultimoAcceso: Date.now() })
      if (!silencioso) toast.success(`Ahora estás como ${usuario.nombre}`, `Rol: ${usuario.rol}`)
    },
    [switchUser, silencioso],
  )
}

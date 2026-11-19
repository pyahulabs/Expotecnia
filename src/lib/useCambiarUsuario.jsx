import { useCallback, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { COLECCIONES } from '@/config/constants'
import { useSession } from '@/context/SessionContext'
import { updateItem } from '@/firebase/hooks'
import { ClaveModal } from '@/modules/usuarios/ClaveModal'

/**
 * Cambia la sesión a otro usuario de la colección `usuarios` y registra su último acceso.
 * Si la cuenta tiene contraseña, abre antes una ventana para pedirla.
 *
 * Devuelve { cambiar, efectuar, claveModal }: hay que dibujar `claveModal` en el componente.
 *  - cambiar(usuario): pide la contraseña si hace falta y luego cambia
 *  - efectuar(usuario): cambia directamente (para quien ya validó la contraseña)
 */
export function useCambiarUsuario({ silencioso = false } = {}) {
  const { switchUser } = useSession()
  const [pendiente, setPendiente] = useState(null)

  const efectuar = useCallback(
    (usuario) => {
      switchUser(usuario)
      updateItem(COLECCIONES.usuarios, usuario.id, { ultimoAcceso: Date.now() })
      if (!silencioso) toast.success(`Ahora estás como ${usuario.nombre}`, `Rol: ${usuario.rol}`)
    },
    [switchUser, silencioso],
  )

  const cambiar = useCallback((usuario) => (usuario.claveHash ? setPendiente(usuario) : efectuar(usuario)), [efectuar])

  const claveModal = (
    <ClaveModal
      open={Boolean(pendiente)}
      usuario={pendiente}
      onClose={() => setPendiente(null)}
      onConfirm={(usuario) => {
        setPendiente(null)
        efectuar(usuario)
      }}
    />
  )

  return { cambiar, efectuar, claveModal }
}

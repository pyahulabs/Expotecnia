import { TriangleAlert } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

/** Diálogo de confirmación para acciones destructivas. */
export function ConfirmDialog({ open, onClose, onConfirm, title = '¿Estás seguro?', description, confirmLabel = 'Eliminar', tone = 'danger' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            data-autofocus
            onClick={() => {
              onConfirm?.()
              onClose?.()
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4 pb-1">
        <div className={`grid size-10 shrink-0 place-items-center rounded-full ${tone === 'danger' ? 'bg-danger-soft text-danger-text' : 'bg-primary-soft text-primary-text'}`}>
          <TriangleAlert size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {description && <p className="mt-1 text-[13px] leading-5 text-fg-muted">{description}</p>}
        </div>
      </div>
    </Modal>
  )
}

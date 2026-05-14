import { useApp } from '../context/AppContext'

export default function ConfirmDialog() {
  const { confirmState, resolveConfirm } = useApp()
  const { open, title, message, confirmLabel, danger } = confirmState

  if (!open) return null

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) resolveConfirm(false) }}>
      <div className="modal modal-confirm">
        <div className="confirm-body">
          <div className="confirm-icon-wrap">
            <div className={`confirm-icon ${danger !== false ? 'danger' : 'primary'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>

          <div className="confirm-title">{title ?? '¿Eliminar este elemento?'}</div>
          {message && <div className="confirm-message">{message}</div>}
        </div>

        <div className="confirm-footer">
          <button className="btn-confirm-cancel" onClick={() => resolveConfirm(false)}>
            Cancelar
          </button>
          <button
            className={`btn-confirm-ok ${danger !== false ? 'danger' : 'primary'}`}
            onClick={() => resolveConfirm(true)}
          >
            {confirmLabel ?? 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

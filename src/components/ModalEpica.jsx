import { useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function ModalEpica() {
  const { epicas, modalEpica, setModalEpica, addEpica } = useApp()

  const idRef    = useRef()
  const titRef   = useRef()
  const rolRef   = useRef()
  const deseoRef = useRef()
  const paraRef  = useRef()

  if (!modalEpica.open) return null

  const close = () => setModalEpica({ open: false })

  const handleOverlay = (e) => { if (e.target === e.currentTarget) close() }

  const handleSave = async () => {
    const data = {
      codigo: idRef.current.value.trim(),
      titulo: titRef.current.value.trim(),
      rol:    rolRef.current.value.trim(),
      deseo:  deseoRef.current.value.trim(),
      para:   paraRef.current.value.trim(),
    }
    if (!data.codigo || !data.titulo) { alert('El ID y el título son obligatorios.'); return }
    await addEpica(data)
    close()
  }

  const defaultId = `EP0${epicas.length + 1}`

  return (
    <div className="modal-overlay open" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge ep">EP</span>
            Nueva Épica
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <label className="form-label">ID Épica</label>
            <input ref={idRef} className="form-input mono" type="text" defaultValue={defaultId} placeholder="EP07" />
          </div>
          <div className="form-row">
            <label className="form-label">Título de la Épica</label>
            <input ref={titRef} className="form-input" type="text" placeholder="Ej. Gestión de reportes académicos" />
          </div>
          <div className="form-row">
            <label className="form-label">Como (Rol de la épica)</label>
            <input ref={rolRef} className="form-input" type="text" placeholder="Ej. Como coordinador académico," />
          </div>
          <div className="form-row">
            <label className="form-label">Deseo…</label>
            <textarea ref={deseoRef} className="form-textarea" placeholder="Deseo poder gestionar y visualizar reportes académicos…" />
          </div>
          <div className="form-row">
            <label className="form-label">Para…</label>
            <textarea ref={paraRef} className="form-textarea" placeholder="Para tomar decisiones basadas en datos reales del proceso formativo." />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave}>Guardar épica</button>
        </div>
      </div>
    </div>
  )
}

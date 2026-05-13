import { useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function ModalTarea() {
  const { tareas, historias, modalTarea, setModalTarea, huSeleccionada, addTarea } = useApp()

  const idRef        = useRef()
  const tipoRef      = useRef()
  const nombreRef    = useRef()
  const estRef       = useRef()
  const prioRef      = useRef()
  const respRef      = useRef()
  const depRef       = useRef()
  const estadoRef    = useRef()
  const condicionRef = useRef()

  if (!modalTarea.open) return null

  const close = () => setModalTarea({ open: false })
  const handleOverlay = (e) => { if (e.target === e.currentTarget) close() }

  const defaultId = `TR${String(tareas.length + 1).padStart(2, '0')}`
  const hu = historias.find(h => h.id === huSeleccionada)

  const handleSave = async () => {
    if (!hu) return
    const data = {
      codigo:       idRef.current.value.trim(),
      nombre:       nombreRef.current.value.trim(),
      tipo:         tipoRef.current.value,
      estimacion:   estRef.current.value,
      prioridad:    prioRef.current.value,
      responsable:  respRef.current.value.trim(),
      dependencias: depRef.current.value.trim(),
      estado:       estadoRef.current.value || '0',
      condicion:    condicionRef.current.value.trim(),
    }
    if (!data.codigo || !data.nombre) { alert('El ID y el nombre son obligatorios.'); return }
    await addTarea(hu, data)
    close()
  }

  return (
    <div className="modal-overlay open" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge tr">TR</span>
            Nueva Tarea
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">ID Tarea</label>
              <input ref={idRef} className="form-input mono" type="text" defaultValue={defaultId} placeholder="TR23" />
            </div>
            <div className="form-row">
              <label className="form-label">Tipo</label>
              <select ref={tipoRef} className="form-select">
                <option>RF</option><option>RNF</option><option>RF/RNF</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Nombre de la tarea</label>
            <input ref={nombreRef} className="form-input" type="text" placeholder="Ej. Diseño de mockup pantalla principal" />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Estimación (días)</label>
              <input ref={estRef} className="form-input" type="number" min="0.5" step="0.5" placeholder="2" />
            </div>
            <div className="form-row">
              <label className="form-label">Prioridad</label>
              <select ref={prioRef} className="form-select">
                <option>ALTA</option><option>MEDIA</option><option>BAJA</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Responsable</label>
            <input ref={respRef} className="form-input" type="text" placeholder="Nombre del integrante" />
          </div>
          <div className="form-row">
            <label className="form-label">Dependencias (ID de tareas)</label>
            <input ref={depRef} className="form-input" type="text" placeholder="TR01, TR05" />
          </div>
          <div className="form-row">
            <label className="form-label">Estado (%)</label>
            <input ref={estadoRef} className="form-input" type="number" min="0" max="100" placeholder="0" />
          </div>
          <div className="form-row">
            <label className="form-label">Condición de aprobación</label>
            <textarea ref={condicionRef} className="form-textarea" style={{ minHeight: 56 }}
              placeholder="Ej. Validado por el instructor y aprobado en revisión de par." />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave}>Guardar tarea</button>
        </div>
      </div>
    </div>
  )
}

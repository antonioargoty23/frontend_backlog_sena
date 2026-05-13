import { useRef } from 'react'
import { useApp } from '../context/AppContext'

export default function ModalHU() {
  const { epicas, historias, modalHU, setModalHU, addHistoria, editHistoria } = useApp()
  const { open, editData, epicaId } = modalHU

  const idRef          = useRef()
  const epicaRef       = useRef()
  const nombreRef      = useRef()
  const rolRef         = useRef()
  const deseoRef       = useRef()
  const paraRef        = useRef()
  const criteriosRef   = useRef()
  const prioridadRef   = useRef()
  const spRef          = useRef()
  const sprintRef      = useRef()
  const estadoRef      = useRef()
  const responsableRef = useRef()
  const comentariosRef = useRef()

  if (!open) return null

  const close = () => setModalHU({ open: false, editData: null, epicaId: null })
  const handleOverlay = (e) => { if (e.target === e.currentTarget) close() }

  const isEdit = !!editData
  const defaultId = editData?.codigo ?? editData?.id ?? `H${String(historias.length + 1).padStart(2, '0')}`

  const handleSave = async () => {
    const data = {
      codigo:       idRef.current.value.trim(),
      nombre:       nombreRef.current.value.trim(),
      rol:          rolRef.current.value.trim(),
      deseo:        deseoRef.current.value.trim(),
      para:         paraRef.current.value.trim(),
      criterios:    criteriosRef.current.value.trim(),
      prioridad:    prioridadRef.current.value,
      sp:           spRef.current.value,
      sprint:       sprintRef.current.value,
      estado:       estadoRef.current.value,
      responsable:  responsableRef.current.value.trim(),
      comentarios:  comentariosRef.current.value.trim(),
    }
    if (!data.codigo || !data.nombre) { alert('El ID y el nombre son obligatorios.'); return }

    const selectedEpicaId = epicaRef.current.value
    if (isEdit) {
      await editHistoria(selectedEpicaId, editData.id, data)
    } else {
      await addHistoria(selectedEpicaId, data)
    }
    close()
  }

  return (
    <div className="modal-overlay open" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge hu">HU</span>
            Historia de Usuario
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">ID Historia</label>
              <input ref={idRef} className="form-input mono" type="text" defaultValue={defaultId} placeholder="H23" />
            </div>
            <div className="form-row">
              <label className="form-label">Épica a la que pertenece</label>
              <select ref={epicaRef} className="form-select" defaultValue={editData?.epicaId ?? epicaId ?? ''}>
                {epicas.map(e => (
                  <option key={e.id} value={e.id}>{e.codigo ?? e.id} · {e.titulo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Nombre de la Historia</label>
            <input ref={nombreRef} className="form-input" type="text" defaultValue={editData?.nombre ?? ''} placeholder="Ej. Consulta de notas por período" />
          </div>
          <div className="form-row">
            <label className="form-label">Como (Rol)</label>
            <input ref={rolRef} className="form-input" type="text" defaultValue={editData?.rol ?? ''} placeholder="Aprendiz" />
          </div>
          <div className="form-row">
            <label className="form-label">Deseo…</label>
            <textarea ref={deseoRef} className="form-textarea" defaultValue={editData?.deseo ?? ''} placeholder="Deseo consultar mis notas…" />
          </div>
          <div className="form-row">
            <label className="form-label">Para…</label>
            <textarea ref={paraRef} className="form-textarea" defaultValue={editData?.para ?? ''} placeholder="Para conocer mi progreso académico…" />
          </div>
          <div className="form-row">
            <label className="form-label">Criterios de Aceptación</label>
            <textarea ref={criteriosRef} className="form-textarea" style={{ minHeight: 90 }} defaultValue={editData?.criterios ?? ''}
              placeholder={'El sistema muestra las notas por período.\nSolo el aprendiz autenticado ve sus notas.'} />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Prioridad</label>
              <select ref={prioridadRef} className="form-select" defaultValue={editData?.prioridad ?? 'Alta'}>
                <option>Alta</option><option>Media</option><option>Baja</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Story Points</label>
              <select ref={spRef} className="form-select" defaultValue={editData?.sp ?? '3'}>
                {[1,2,3,5,8,13,20,40].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Sprint #</label>
              <input ref={sprintRef} className="form-input" type="number" min="1" defaultValue={editData?.sprint ?? 1} placeholder="1" />
            </div>
            <div className="form-row">
              <label className="form-label">Estado</label>
              <select ref={estadoRef} className="form-select" defaultValue={editData?.estado ?? 'Por hacer'}>
                <option>Por hacer</option><option>En progreso</option><option>Hecho</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Responsable</label>
            <input ref={responsableRef} className="form-input" type="text" defaultValue={editData?.responsable ?? ''} placeholder="Nombre del integrante" />
          </div>
          <div className="form-row">
            <label className="form-label">Comentarios</label>
            <textarea ref={comentariosRef} className="form-textarea" style={{ minHeight: 50 }} defaultValue={editData?.comentarios ?? ''} placeholder="Observaciones adicionales…" />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave}>Guardar historia</button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const TIPOS = [
  { value: 'frontend',      label: 'Frontend / UI' },
  { value: 'backend',       label: 'Backend / API' },
  { value: 'base_datos',    label: 'Base de datos' },
  { value: 'pruebas',       label: 'Pruebas / Testing' },
  { value: 'documentacion', label: 'Documentación' },
]
const PRIORIDADES = ['ALTA', 'MEDIA', 'BAJA']

function ErrMsg({ msg }) {
  if (!msg) return null
  return (
    <span className="form-error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </span>
  )
}

const EMPTY = {
  codigo: '', nombre: '', tipo: 'frontend',
  estado_pct: 0, responsable_id: '',
  estimacion: '', prioridad: 'ALTA', dependencias: '', condicion: '',
}

export default function FormTarea() {
  const { tareas, historias, modalTarea, setModalTarea, huSeleccionada, addTarea, editTarea } = useApp()
  const { open, editData, huActual: huFromModal } = modalTarea
  const isEdit = !!editData

  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit) {
      setForm({
        codigo:       editData.codigo ?? editData.id ?? '',
        nombre:       editData.nombre ?? '',
        tipo:         editData.tipo ?? 'frontend',
        estado_pct:   parseInt(editData.estado) || 0,
        responsable_id: editData.responsable ?? '',
        estimacion:   String(editData.estimacion ?? ''),
        prioridad:    editData.prioridad ?? 'ALTA',
        dependencias: editData.dependencias ?? '',
        condicion:    editData.condicion ?? '',
      })
    } else {
      setForm({
        ...EMPTY,
        codigo: `TR${String(tareas.length + 1).padStart(2, '0')}`,
      })
    }
    setErrors({})
    setSaving(false)
  }, [open])

  if (!open) return null

  const hu = huFromModal ?? historias.find(h => h.id === huSeleccionada)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const setNum = (field) => (e) => setForm(f => ({ ...f, [field]: Number(e.target.value) }))

  const validate = () => {
    const errs = {}
    if (!form.codigo.trim()) errs.codigo = 'El código es obligatorio.'
    if (!form.nombre.trim()) errs.nombre = 'El título es obligatorio.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const close = () => setModalTarea({ open: false, editData: null, huActual: null })

  const handleSave = async () => {
    if (!hu)       { close(); return }
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        codigo:       form.codigo.trim(),
        nombre:       form.nombre.trim(),
        tipo:         form.tipo,
        estado:       String(form.estado_pct),
        responsable:  form.responsable_id.trim(),
        estimacion:   form.estimacion,
        prioridad:    form.prioridad,
        dependencias: form.dependencias.trim(),
        condicion:    form.condicion.trim(),
      }
      if (isEdit) {
        await editTarea(hu, editData.id, payload)
      } else {
        await addTarea(hu, payload)
      }
      close()
    } catch {
      setSaving(false)
    }
  }

  const tipoLabel = TIPOS.find(t => t.value === form.tipo)?.label ?? form.tipo
  const pct = form.estado_pct

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="modal">

        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge tr">TR</span>
            {isEdit ? 'Editar Tarea' : 'Nueva Tarea'}
            {hu && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                {' '}— {hu.codigo ?? hu.id}
              </span>
            )}
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body">

          {/* Código + Tipo */}
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label req">
                Código
                {form.codigo && <span className="form-code-preview tr">{form.codigo}</span>}
              </label>
              <input
                className={`form-input mono${errors.codigo ? ' invalid' : ''}`}
                type="text"
                value={form.codigo}
                onChange={set('codigo')}
                placeholder="TR01"
                maxLength={12}
                autoFocus
              />
              <ErrMsg msg={errors.codigo} />
            </div>
            <div className="form-row">
              <label className="form-label req">Tipo de tarea</label>
              <select className="form-select" value={form.tipo} onChange={set('tipo')}>
                {TIPOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Título */}
          <div className="form-row">
            <div className="form-label-row">
              <label className="form-label req">Título de la tarea</label>
              <span className={`form-char-count${form.nombre.length > 90 ? ' at-max' : form.nombre.length > 70 ? ' near' : ''}`}>
                {form.nombre.length}/100
              </span>
            </div>
            <input
              className={`form-input${errors.nombre ? ' invalid' : ''}`}
              type="text"
              value={form.nombre}
              onChange={set('nombre')}
              placeholder="Ej. Diseño de la pantalla de inicio"
              maxLength={100}
            />
            <ErrMsg msg={errors.nombre} />
          </div>

          {/* Estado % (slider) */}
          <div className="form-row">
            <label className="form-label">Avance (%)</label>
            <div className="form-slider-wrap">
              <input
                type="range"
                className="form-slider"
                min="0"
                max="100"
                step="5"
                value={pct}
                onChange={setNum('estado_pct')}
              />
              <span className="form-slider-val">{pct}%</span>
            </div>
            <span className="form-hint">
              {pct === 0 ? 'Sin iniciar' : pct < 50 ? 'En progreso temprano' : pct < 100 ? 'En progreso avanzado' : 'Completada ✓'}
            </span>
          </div>

          {/* Responsable */}
          <div className="form-row">
            <label className="form-label">Responsable</label>
            <input
              className="form-input"
              type="text"
              value={form.responsable_id}
              onChange={set('responsable_id')}
              placeholder="Nombre o ID del integrante asignado"
            />
          </div>

          {/* ── Datos adicionales ── */}
          <div className="form-section">
            <div className="form-section-title">Datos adicionales</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div className="form-grid">
                <div className="form-row">
                  <label className="form-label">Estimación (días)</label>
                  <input className="form-input" type="number" min="0.5" step="0.5" value={form.estimacion} onChange={set('estimacion')} placeholder="2" />
                </div>
                <div className="form-row">
                  <label className="form-label">Prioridad</label>
                  <select className="form-select" value={form.prioridad} onChange={set('prioridad')}>
                    {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Dependencias (códigos separados por coma)</label>
                <input className="form-input" type="text" value={form.dependencias} onChange={set('dependencias')} placeholder="TR01, TR05" />
              </div>
              <div className="form-row">
                <label className="form-label">Condición de aprobación</label>
                <textarea
                  className="form-textarea"
                  value={form.condicion}
                  onChange={set('condicion')}
                  style={{ minHeight: 56 }}
                  placeholder="Ej. Revisado y aprobado por el instructor en reunión de sprint."
                />
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar tarea' : 'Crear tarea'}
          </button>
        </div>

      </div>
    </div>
  )
}

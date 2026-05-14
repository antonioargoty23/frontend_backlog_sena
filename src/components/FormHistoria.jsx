import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21]
const PRIORIDADES = ['Alta', 'Media', 'Baja']
const ESTADOS = ['Por hacer', 'En progreso', 'Hecho']
const HU_RE = /^[A-Z]{1,3}\d{2,}$/i

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
  codigo: '', nombre: '', rol: '', deseo: '', para: '',
  criterios: '', prioridad: 'Alta', sp: '3',
  sprint: '1', estado: 'Por hacer', responsable: '', comentarios: '',
}

export default function FormHistoria() {
  const { epicas, historias, modalHU, setModalHU, addHistoria, editHistoria } = useApp()
  const { open, editData, epicaId } = modalHU
  const isEdit = !!editData

  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isEdit) {
      setForm({
        codigo:      editData.codigo ?? editData.id ?? '',
        nombre:      editData.nombre ?? '',
        rol:         editData.rol ?? '',
        deseo:       editData.deseo ?? '',
        para:        editData.para ?? '',
        criterios:   editData.criterios ?? '',
        prioridad:   editData.prioridad ?? 'Alta',
        sp:          String(editData.sp ?? '3'),
        sprint:      String(editData.sprint ?? '1'),
        estado:      editData.estado ?? 'Por hacer',
        responsable: editData.responsable ?? '',
        comentarios: editData.comentarios ?? '',
      })
    } else {
      setForm({
        ...EMPTY,
        codigo:   `HU${String(historias.length + 1).padStart(2, '0')}`,
        epicaId:  epicaId ?? epicas[0]?.id ?? '',
      })
    }
    setErrors({})
    setSaving(false)
  }, [open])

  if (!open) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const selectedEpicaId = form.epicaId ?? epicaId ?? epicas[0]?.id ?? ''

  const validate = () => {
    const errs = {}
    if (!form.codigo.trim())  errs.codigo = 'El código es obligatorio.'
    if (!form.nombre.trim())  errs.nombre = 'El título es obligatorio.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const close = () => setModalHU({ open: false, editData: null, epicaId: null })

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { ...form, codigo: form.codigo.trim(), nombre: form.nombre.trim() }
      const eId = form.epicaId ?? epicaId ?? epicas[0]?.id
      if (isEdit) {
        await editHistoria(eId, editData.id, payload)
      } else {
        await addHistoria(eId, payload)
      }
      close()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="modal" style={{ maxWidth: 640 }}>

        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge hu">HU</span>
            {isEdit ? 'Editar Historia' : 'Nueva Historia de Usuario'}
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body">

          {/* Código + Épica */}
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label req">
                Código
                {form.codigo && <span className="form-code-preview hu">{form.codigo}</span>}
              </label>
              <input
                className={`form-input mono${errors.codigo ? ' invalid' : ''}`}
                type="text"
                value={form.codigo}
                onChange={set('codigo')}
                placeholder="HU01"
                maxLength={12}
                autoFocus
              />
              <ErrMsg msg={errors.codigo} />
            </div>
            <div className="form-row">
              <label className="form-label req">Épica</label>
              <select
                className="form-select"
                value={form.epicaId ?? epicaId ?? ''}
                onChange={set('epicaId')}
              >
                {epicas.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.codigo ?? e.id} · {e.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Título */}
          <div className="form-row">
            <div className="form-label-row">
              <label className="form-label req">Título / Nombre</label>
              <span className={`form-char-count${form.nombre.length > 90 ? ' at-max' : form.nombre.length > 70 ? ' near' : ''}`}>
                {form.nombre.length}/100
              </span>
            </div>
            <input
              className={`form-input${errors.nombre ? ' invalid' : ''}`}
              type="text"
              value={form.nombre}
              onChange={set('nombre')}
              placeholder="Ej. Consulta de notas por período académico"
              maxLength={100}
            />
            <ErrMsg msg={errors.nombre} />
          </div>

          {/* SP + Prioridad */}
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label req">Story Points</label>
              <select className="form-select" value={form.sp} onChange={set('sp')}>
                {FIBONACCI.map(n => (
                  <option key={n} value={String(n)}>{n} SP</option>
                ))}
              </select>
              <span className="form-hint">Escala Fibonacci: {FIBONACCI.join(' · ')}</span>
            </div>
            <div className="form-row">
              <label className="form-label req">Prioridad</label>
              <select className="form-select" value={form.prioridad} onChange={set('prioridad')}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Criterios de aceptación */}
          <div className="form-row">
            <div className="form-label-row">
              <label className="form-label req">Criterios de Aceptación</label>
              <span className="form-hint" style={{ marginTop: 0 }}>Un criterio por línea</span>
            </div>
            <textarea
              className={`form-textarea${errors.criterios ? ' invalid' : ''}`}
              value={form.criterios}
              onChange={set('criterios')}
              placeholder={'El sistema muestra los datos correctamente.\nSolo usuarios autenticados pueden acceder.\nSe validan los campos requeridos.'}
              style={{ minHeight: 90 }}
              maxLength={1000}
            />
          </div>

          {/* ── Datos adicionales (colapsables implícitamente) ── */}
          <div className="form-section">
            <div className="form-section-title">Datos de la historia (formato ágil)</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div className="form-row">
                <label className="form-label">Como (Rol)</label>
                <input className="form-input" type="text" value={form.rol} onChange={set('rol')} placeholder="Ej. aprendiz, instructor, coordinador…" />
              </div>
              <div className="form-row">
                <label className="form-label">Deseo…</label>
                <textarea className="form-textarea" value={form.deseo} onChange={set('deseo')} placeholder="Deseo poder ver mi progreso académico…" style={{ minHeight: 60 }} />
              </div>
              <div className="form-row">
                <label className="form-label">Para…</label>
                <textarea className="form-textarea" value={form.para} onChange={set('para')} placeholder="Para tomar decisiones sobre mi aprendizaje." style={{ minHeight: 56 }} />
              </div>
            </div>
          </div>

          {/* ── Seguimiento ── */}
          <div className="form-section">
            <div className="form-section-title">Seguimiento</div>
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label">Sprint #</label>
                <input className="form-input" type="number" min="1" value={form.sprint} onChange={set('sprint')} placeholder="1" />
              </div>
              <div className="form-row">
                <label className="form-label">Estado</label>
                <select className="form-select" value={form.estado} onChange={set('estado')}>
                  {ESTADOS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Responsable</label>
                <input className="form-input" type="text" value={form.responsable} onChange={set('responsable')} placeholder="Nombre del integrante" />
              </div>
              <div className="form-row">
                <label className="form-label">Comentarios</label>
                <input className="form-input" type="text" value={form.comentarios} onChange={set('comentarios')} placeholder="Observaciones…" />
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar historia' : 'Crear historia'}
          </button>
        </div>

      </div>
    </div>
  )
}

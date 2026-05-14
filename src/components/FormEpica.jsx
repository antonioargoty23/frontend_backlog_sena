import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const EP_RE = /^EP\d{2,}$/i

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

export default function FormEpica() {
  const { epicas, modalEpica, setModalEpica, addEpica, editEpica } = useApp()
  const { open, editData } = modalEpica
  const isEdit = !!editData

  const [form, setForm]   = useState({ codigo: '', titulo: '', descripcion: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({
      codigo:      editData?.codigo ?? editData?.id ?? `EP${String(epicas.length + 1).padStart(2, '0')}`,
      titulo:      editData?.titulo ?? '',
      descripcion: editData?.descripcion ?? editData?.deseo ?? '',
    })
    setErrors({})
    setSaving(false)
  }, [open])

  if (!open) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!EP_RE.test(form.codigo.trim()))  errs.codigo = 'Formato requerido: EP01, EP02…'
    if (!form.titulo.trim())              errs.titulo  = 'El título es obligatorio.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const close = () => setModalEpica({ open: false, editData: null })

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        codigo:      form.codigo.trim().toUpperCase(),
        titulo:      form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        deseo:       form.descripcion.trim(),
      }
      if (isEdit) {
        await editEpica(editData.id, payload)
      } else {
        await addEpica(payload)
      }
      close()
    } catch {
      setSaving(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) handleSave() }

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="modal" onKeyDown={handleKey}>

        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge ep">EP</span>
            {isEdit ? 'Editar Épica' : 'Nueva Épica'}
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body">

          {/* Código */}
          <div className="form-row">
            <label className="form-label req">
              Código
              {form.codigo && EP_RE.test(form.codigo.trim()) && (
                <span className="form-code-preview ep">{form.codigo.toUpperCase()}</span>
              )}
            </label>
            <input
              className={`form-input mono${errors.codigo ? ' invalid' : ''}`}
              type="text"
              value={form.codigo}
              onChange={set('codigo')}
              placeholder="EP01"
              maxLength={10}
              autoFocus
            />
            <ErrMsg msg={errors.codigo} />
            <span className="form-hint">Formato EPnn — dos o más dígitos después de «EP».</span>
          </div>

          {/* Título */}
          <div className="form-row">
            <div className="form-label-row">
              <label className="form-label req">Título de la Épica</label>
              <span className={`form-char-count${form.titulo.length > 90 ? ' at-max' : form.titulo.length > 70 ? ' near' : ''}`}>
                {form.titulo.length}/100
              </span>
            </div>
            <input
              className={`form-input${errors.titulo ? ' invalid' : ''}`}
              type="text"
              value={form.titulo}
              onChange={set('titulo')}
              placeholder="Ej. Gestión de reportes académicos"
              maxLength={100}
            />
            <ErrMsg msg={errors.titulo} />
          </div>

          {/* Descripción */}
          <div className="form-row">
            <div className="form-label-row">
              <label className="form-label">Descripción</label>
              <span className={`form-char-count${form.descripcion.length > 230 ? ' at-max' : form.descripcion.length > 180 ? ' near' : ''}`}>
                {form.descripcion.length}/250
              </span>
            </div>
            <textarea
              className="form-textarea"
              value={form.descripcion}
              onChange={set('descripcion')}
              placeholder="Describe el objetivo de esta épica y el valor que aporta al proyecto…"
              maxLength={250}
              style={{ minHeight: 80 }}
            />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar épica' : 'Crear épica'}
          </button>
        </div>

      </div>
    </div>
  )
}

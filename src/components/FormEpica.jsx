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

const EMPTY = { codigo: '', rol: '', deseo: '', para: '' }

export default function FormEpica() {
  const { epicas, modalEpica, setModalEpica, addEpica, editEpica } = useApp()
  const { open, editData } = modalEpica
  const isEdit = !!editData

  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({
      codigo: editData?.codigo ?? `EP${String(epicas.length + 1).padStart(2, '0')}`,
      rol:    editData?.rol   ?? '',
      deseo:  editData?.deseo ?? '',
      para:   editData?.para  ?? '',
    })
    setErrors({})
    setSaving(false)
  }, [open])

  if (!open) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!EP_RE.test(form.codigo.trim())) errs.codigo = 'Formato requerido: EP01, EP02…'
    if (!form.rol.trim())               errs.rol    = 'El rol es obligatorio.'
    if (!form.deseo.trim())             errs.deseo  = 'Este campo es obligatorio.'
    if (!form.para.trim())              errs.para   = 'Este campo es obligatorio.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const close = () => setModalEpica({ open: false, editData: null })

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        codigo: form.codigo.trim().toUpperCase(),
        rol:    form.rol.trim(),
        deseo:  form.deseo.trim(),
        para:   form.para.trim(),
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

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="modal">

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

          {/* Como (Rol) */}
          <div className="form-row">
            <label className="form-label req">Como… (Rol)</label>
            <input
              className={`form-input${errors.rol ? ' invalid' : ''}`}
              type="text"
              value={form.rol}
              onChange={set('rol')}
              placeholder="Usuario, Administrador, Instructor…"
              maxLength={150}
            />
            <ErrMsg msg={errors.rol} />
          </div>

          {/* Deseo */}
          <div className="form-row">
            <label className="form-label req">Deseo…</label>
            <textarea
              className={`form-textarea${errors.deseo ? ' invalid' : ''}`}
              value={form.deseo}
              onChange={set('deseo')}
              placeholder="registrarme e iniciar sesión en la plataforma"
              maxLength={500}
              style={{ minHeight: 72 }}
            />
            <ErrMsg msg={errors.deseo} />
          </div>

          {/* Para */}
          <div className="form-row">
            <label className="form-label req">Para…</label>
            <textarea
              className={`form-textarea${errors.para ? ' invalid' : ''}`}
              value={form.para}
              onChange={set('para')}
              placeholder="acceder a los cursos del programa"
              maxLength={500}
              style={{ minHeight: 72 }}
            />
            <ErrMsg msg={errors.para} />
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

import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

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

const EMPTY = { codigo: '', epicaId: '', rol: '', deseo: '', para: '', criterios_aceptacion: '' }

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
        codigo:               editData.codigo ?? '',
        epicaId:              editData.epicaId ?? epicaId ?? epicas[0]?.id ?? '',
        rol:                  editData.rol   ?? '',
        deseo:                editData.deseo ?? '',
        para:                 editData.para  ?? '',
        criterios_aceptacion: editData.criterios ?? '',
      })
    } else {
      setForm({
        ...EMPTY,
        codigo:  `HU${String(historias.length + 1).padStart(2, '0')}`,
        epicaId: epicaId ?? epicas[0]?.id ?? '',
      })
    }
    setErrors({})
    setSaving(false)
  }, [open])

  if (!open) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.codigo.trim()) errs.codigo = 'El código es obligatorio.'
    if (!form.epicaId)       errs.epicaId = 'Selecciona una épica.'
    if (!form.rol.trim())    errs.rol     = 'El rol es obligatorio.'
    if (!form.deseo.trim())  errs.deseo   = 'Este campo es obligatorio.'
    if (!form.para.trim())   errs.para    = 'Este campo es obligatorio.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const close = () => setModalHU({ open: false, editData: null, epicaId: null })

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        codigo:               form.codigo.trim(),
        rol:                  form.rol.trim(),
        deseo:                form.deseo.trim(),
        para:                 form.para.trim(),
        criterios_aceptacion: form.criterios_aceptacion.trim() || undefined,
      }
      const eId = Number(form.epicaId) || epicaId || epicas[0]?.id
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
      <div className="modal" style={{ maxWidth: 620 }}>

        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge hu">HU</span>
            {isEdit ? 'Editar Historia' : 'Nueva Historia de Usuario'}
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body">

          {/* ── SECCIÓN 1: Identificación ── */}
          <div className="form-section" style={{ border: 'none', paddingTop: 0 }}>
            <div className="form-section-title">Identificación</div>

            <div className="form-grid">
              {/* Código */}
              <div className="form-row">
                <label className="form-label req">
                  Código
                  {form.codigo && (
                    <span className="form-code-preview hu">{form.codigo.toUpperCase()}</span>
                  )}
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

              {/* Épica */}
              <div className="form-row">
                <label className="form-label req">Épica</label>
                <select
                  className={`form-select${errors.epicaId ? ' invalid' : ''}`}
                  value={form.epicaId}
                  onChange={set('epicaId')}
                >
                  <option value="">— Selecciona una épica —</option>
                  {epicas.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.codigo} · {e.rol ? `Como ${e.rol}` : e.titulo ?? e.id}
                    </option>
                  ))}
                </select>
                <ErrMsg msg={errors.epicaId} />
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 2: Datos de la Historia ── */}
          <div className="form-section">
            <div className="form-section-title">Datos de la Historia (formato ágil)</div>

            {/* Como (Rol) */}
            <div className="form-row" style={{ marginBottom: 13 }}>
              <label className="form-label req">Como… (Rol)</label>
              <input
                className={`form-input${errors.rol ? ' invalid' : ''}`}
                type="text"
                value={form.rol}
                onChange={set('rol')}
                placeholder="aprendiz, instructor, coordinador…"
                maxLength={150}
              />
              <ErrMsg msg={errors.rol} />
            </div>

            {/* Deseo */}
            <div className="form-row" style={{ marginBottom: 13 }}>
              <label className="form-label req">Deseo…</label>
              <textarea
                className={`form-textarea${errors.deseo ? ' invalid' : ''}`}
                value={form.deseo}
                onChange={set('deseo')}
                placeholder="consultar mis notas del período académico actual"
                maxLength={500}
                style={{ minHeight: 68 }}
              />
              <ErrMsg msg={errors.deseo} />
            </div>

            {/* Para */}
            <div className="form-row" style={{ marginBottom: 13 }}>
              <label className="form-label req">Para…</label>
              <textarea
                className={`form-textarea${errors.para ? ' invalid' : ''}`}
                value={form.para}
                onChange={set('para')}
                placeholder="tomar decisiones sobre mi proceso de aprendizaje"
                maxLength={500}
                style={{ minHeight: 68 }}
              />
              <ErrMsg msg={errors.para} />
            </div>

            {/* Criterios de Aceptación */}
            <div className="form-row">
              <div className="form-label-row">
                <label className="form-label">Criterios de Aceptación</label>
                <span className="form-hint" style={{ marginTop: 0 }}>Un criterio por línea</span>
              </div>
              <textarea
                className="form-textarea"
                value={form.criterios_aceptacion}
                onChange={set('criterios_aceptacion')}
                placeholder={'El sistema muestra los datos correctamente.\nSolo usuarios autenticados pueden acceder.\nSe validan los campos requeridos.'}
                maxLength={1000}
                style={{ minHeight: 90 }}
              />
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

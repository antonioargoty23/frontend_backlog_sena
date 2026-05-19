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

const EMPTY = { codigo: '', epicaId: '', como: '', deseo: '', para: '', criterios_aceptacion: '' }

export default function FormHistoria() {
  const { epicas, historias, modalHU, setModalHU, addHistoria, editHistoria } = useApp()
  const { open, editData, epicaId } = modalHU
  const isEdit = !!editData

  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Calcula el siguiente código disponible para una épica dada,
  // basándose en las historias ya cargadas en el estado global.
  const getNextCodigo = (eId) => {
    const num = Number(eId)
    if (!num) return 'HU01'
    const hus = historias.filter(h => (h.epicaId ?? h.epica_id) === num)
    const usados = hus
      .map(h => { const m = String(h.codigo ?? '').match(/^HU(\d+)$/i); return m ? parseInt(m[1], 10) : 0 })
      .filter(n => n > 0)
    const max = usados.length > 0 ? Math.max(...usados) : 0
    return `HU${String(max + 1).padStart(2, '0')}`
  }

  useEffect(() => {
    if (!open) return
    if (isEdit) {
      setForm({
        codigo:               editData.codigo    ?? '',
        epicaId:              editData.epicaId   ?? epicaId ?? epicas[0]?.id ?? '',
        como:                 editData.rol       ?? '',
        deseo:                editData.deseo     ?? '',
        para:                 editData.para      ?? '',
        criterios_aceptacion: editData.criterios ?? '',
      })
    } else {
      const eId = epicaId ?? epicas[0]?.id ?? ''
      setForm({
        ...EMPTY,
        codigo:  getNextCodigo(eId),
        epicaId: eId,
      })
    }
    setErrors({})
    setSaving(false)
  }, [open])

  if (!open) return null

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  // Al cambiar la épica regenera automáticamente el siguiente código disponible
  const handleEpicaChange = (e) => {
    const eId = e.target.value
    setForm(f => ({ ...f, epicaId: eId, codigo: getNextCodigo(eId) }))
  }

  const validate = () => {
    const errs = {}
    if (!form.codigo.trim()) errs.codigo = 'El código es obligatorio.'
    if (!form.epicaId)       errs.epicaId = 'Selecciona una épica.'
    if (!form.como.trim())   errs.como    = 'El rol es obligatorio.'
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
      const eId = Number(form.epicaId) || epicaId || epicas[0]?.id
      const payload = {
        codigo:               form.codigo.trim(),
        epica_id:             Number(eId),
        como:                 form.como.trim(),
        deseo:                form.deseo.trim(),
        para:                 form.para.trim(),
        criterios_aceptacion: form.criterios_aceptacion.trim() || undefined,
      }
      if (isEdit) {
        await editHistoria(eId, editData.id, payload)
      } else {
        await addHistoria(eId, payload)
      }
      close()
    } catch (err) {
      setSaving(false)
      const msg =
        err?.response?.data?.errors?.[0]?.message ??
        err?.response?.data?.message ??
        err?.message ??
        'Error al guardar la historia'
      setErrors({ _global: msg })
      console.error('[FormHistoria] Error al guardar:', err?.response?.data ?? err)
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
              {/* Código — solo lectura, auto-generado por épica */}
              <div className="form-row">
                <label className="form-label">
                  Código
                  {form.codigo && (
                    <span className="form-code-preview hu">{form.codigo.toUpperCase()}</span>
                  )}
                </label>
                <input
                  className="form-input mono auto"
                  type="text"
                  value={form.codigo}
                  readOnly
                  tabIndex={-1}
                  placeholder="HU01"
                />
                <span className="form-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  Generado automáticamente · cambia al elegir épica
                </span>
              </div>

              {/* Épica */}
              <div className="form-row">
                <label className="form-label req">Épica</label>
                <select
                  className={`form-select${errors.epicaId ? ' invalid' : ''}`}
                  value={form.epicaId}
                  onChange={handleEpicaChange}
                  autoFocus={!isEdit}
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
                className={`form-input${errors.como ? ' invalid' : ''}`}
                type="text"
                value={form.como}
                onChange={set('como')}
                placeholder="aprendiz, instructor, coordinador…"
                maxLength={150}
              />
              <ErrMsg msg={errors.como} />
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
          {errors._global && (
            <span className="form-error" style={{ flex: 1, marginRight: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errors._global}
            </span>
          )}
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Actualizar historia' : 'Crear historia'}
          </button>
        </div>

      </div>
    </div>
  )
}

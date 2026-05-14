import { useState, useEffect, useCallback } from 'react'
import { getFichas, createFicha } from '../api/fichas'

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

function ModalNuevaFicha({ onCreated, onClose }) {
  const [form, setForm]     = useState({ codigo: '', programa: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.codigo.trim())   errs.codigo   = 'El código es obligatorio.'
    if (!form.programa.trim()) errs.programa = 'El nombre del programa es obligatorio.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const res = await createFicha({ codigo: form.codigo.trim(), programa: form.programa.trim() })
      onCreated(res.data?.data ?? res.data)
    } catch {
      setSaving(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="modal-overlay open"
      style={{ zIndex: 1100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal" style={{ maxWidth: 420 }} onKeyDown={handleKey}>

        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge" style={{ background: '#fef3c7', color: '#92400e' }}>FC</span>
            Nueva Ficha
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          <div className="form-row">
            <label className="form-label req">Código de ficha</label>
            <input
              className={`form-input mono${errors.codigo ? ' invalid' : ''}`}
              type="text"
              value={form.codigo}
              onChange={set('codigo')}
              placeholder="Ej. 2758960"
              maxLength={20}
              autoFocus
            />
            <ErrMsg msg={errors.codigo} />
            <span className="form-hint">Número o código identificador de la ficha.</span>
          </div>

          <div className="form-row">
            <label className="form-label req">Nombre del programa</label>
            <input
              className={`form-input${errors.programa ? ' invalid' : ''}`}
              type="text"
              value={form.programa}
              onChange={set('programa')}
              placeholder="Ej. Análisis y Desarrollo de Software"
              maxLength={200}
            />
            <ErrMsg msg={errors.programa} />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear ficha'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function FichaSelector({ value, onChange, invalid }) {
  const [fichas, setFichas]       = useState([])
  const [cargando, setCargando]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const cargarFichas = useCallback(() => {
    setCargando(true)
    getFichas()
      .then(res => setFichas(res.data?.data ?? []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargarFichas() }, [cargarFichas])

  const handleFichaCreada = (nueva) => {
    // Agrega optimísticamente y selecciona de inmediato
    setFichas(prev => [...prev, nueva])
    onChange(nueva.id)
    setModalOpen(false)
    // Recarga en segundo plano para confirmar
    getFichas().then(res => setFichas(res.data?.data ?? [])).catch(console.error)
  }

  return (
    <div className="ficha-selector-wrap">
      <select
        className={`form-select${invalid ? ' invalid' : ''}`}
        value={value ?? ''}
        onChange={e => onChange(Number(e.target.value))}
        disabled={cargando}
      >
        <option value="" disabled>
          {cargando ? 'Cargando fichas…' : 'Selecciona una ficha…'}
        </option>
        {fichas.map(f => (
          <option key={f.id} value={f.id}>
            {f.codigo} · {f.nombre}
          </option>
        ))}
      </select>

      <button type="button" className="btn-nueva-ficha" onClick={() => setModalOpen(true)}>
        + Nueva ficha
      </button>

      {modalOpen && (
        <ModalNuevaFicha
          onCreated={handleFichaCreada}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

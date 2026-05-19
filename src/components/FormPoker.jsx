import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

// Valores Fibonacci estándar de planning poker
const SP_VALUES = [1, 2, 3, 5, 8, 13, 21]

const PRIORIDADES = ['Alta', 'Media', 'Baja']

const ESTADOS = ['Por hacer', 'En progreso', 'Hecho']

const EMPTY = {
  story_points: null,
  prioridad:    '',
  sprint:       '',
  estado:       'Por hacer',
  responsable:  '',
}

export default function FormPoker() {
  const { modalPoker, setModalPoker, savePlanHistoria } = useApp()
  const { open, historia } = modalPoker

  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!open || !historia) return
    setForm({
      story_points: historia.storyPoints ?? null,
      prioridad:    historia.prioridad   ?? '',
      sprint:       historia.sprint      ?? '',
      estado:       historia.estado      ?? 'Por hacer',
      responsable:  historia.responsable ?? '',
    })
    setSaving(false)
    setError(null)
  }, [open])

  if (!open || !historia) return null

  const close = () => setModalPoker({ open: false, historia: null })

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await savePlanHistoria(historia, {
        story_points: form.story_points,
        prioridad:    form.prioridad    || undefined,
        sprint:       form.sprint !== '' ? Number(form.sprint) : null,
        estado:       form.estado       || undefined,
        responsable:  form.responsable.trim() || null,
      })
      close()
    } catch (err) {
      setSaving(false)
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.errors?.[0]?.message ??
        'Error al guardar'
      )
    }
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="modal poker-modal" style={{ maxWidth: 540 }}>

        {/* ── Cabecera ── */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge poker-badge">
              {/* Ícono de cartas */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 2h11a2 2 0 012 2v1h1a2 2 0 012 2v13a2 2 0 01-2 2H8a2 2 0 01-2-2v-1H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v13h2V7a2 2 0 012-2h7V4H4zm4 3v13h11V7H8z"/>
              </svg>
            </span>
            Planning Poker ·{' '}
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--sena-green)', fontSize: 13 }}>
              {historia.codigo}
            </span>
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        <div className="modal-body" style={{ gap: 18 }}>

          {/* Historia resumida */}
          <div className="poker-hu-summary">
            {historia.rol
              ? <><span className="poker-hu-rol">Como {historia.rol},</span>{' '}<span className="poker-hu-deseo">{historia.deseo}</span></>
              : <span className="poker-hu-deseo">{historia.nombre}</span>
            }
          </div>

          {/* ── Story Points (chips Fibonacci) ── */}
          <div className="form-row">
            <label className="form-label">Story Points</label>
            <div className="poker-sp-chips">
              {/* Chip para limpiar */}
              <button
                type="button"
                className={`poker-sp-chip${form.story_points === null ? ' selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, story_points: null }))}
              >
                —
              </button>
              {SP_VALUES.map(v => (
                <button
                  key={v}
                  type="button"
                  className={`poker-sp-chip${form.story_points === v ? ' selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, story_points: v }))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* ── Grid: Prioridad + Sprint ── */}
          <div className="form-grid">

            {/* Prioridad */}
            <div className="form-row">
              <label className="form-label">Prioridad</label>
              <div className="poker-prio-group">
                {PRIORIDADES.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`poker-prio-btn prio-${p.toLowerCase()}${form.prioridad === p ? ' selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, prioridad: p }))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Sprint */}
            <div className="form-row">
              <label className="form-label">Sprint</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 14 }}>S</span>
                <input
                  className="form-input mono"
                  type="number"
                  min="1"
                  max="99"
                  value={form.sprint}
                  onChange={e => setForm(f => ({ ...f, sprint: e.target.value }))}
                  placeholder="1"
                  style={{ maxWidth: 80 }}
                />
              </div>
              <span className="form-hint">Número del sprint (S1, S2…)</span>
            </div>
          </div>

          {/* ── Estado ── */}
          <div className="form-row">
            <label className="form-label">Estado</label>
            <div className="poker-estado-group">
              {ESTADOS.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`poker-estado-btn estado-${e.toLowerCase().replace(/ /g, '-')}${form.estado === e ? ' selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, estado: e }))}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* ── Responsable ── */}
          <div className="form-row">
            <label className="form-label">Responsable</label>
            <input
              className="form-input"
              type="text"
              value={form.responsable}
              onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))}
              placeholder="Nombre del responsable"
              maxLength={150}
            />
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          {error && (
            <span className="form-error" style={{ flex: 1 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </span>
          )}
          <button className="btn-modal-cancel" onClick={close}>Cancelar</button>
          <button className="btn-modal-save btn-poker-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar planificación'}
          </button>
        </div>

      </div>
    </div>
  )
}

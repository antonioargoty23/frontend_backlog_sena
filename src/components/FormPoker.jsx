import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

// Vehículos Fibonacci — complejidad creciente
const SP_VEHICLES = [
  { value: 0,  emoji: '🛹', label: 'Skateboard',  tooltip: 'Skateboard — trivial, casi sin esfuerzo' },
  { value: 1,  emoji: '🛵', label: 'Scooter',     tooltip: 'Scooter — muy pequeño, pocas horas' },
  { value: 2,  emoji: '🚲', label: 'Bicicleta',   tooltip: 'Bicicleta — pequeño, medio día' },
  { value: 3,  emoji: '🛴', label: 'Patineta',    tooltip: 'Patineta — pequeño-mediano, un día' },
  { value: 5,  emoji: '🚗', label: 'Auto',        tooltip: 'Auto — mediano, varios días' },
  { value: 8,  emoji: '🚌', label: 'Bus',         tooltip: 'Bus — medio-alto, casi un sprint' },
  { value: 13, emoji: '🚛', label: 'Camión',      tooltip: 'Camión — grande, considerar dividir' },
  { value: 21, emoji: '🚀', label: 'Cohete',      tooltip: 'Cohete — épico, dividir obligatoriamente' },
]

const PRIORIDADES = ['alta', 'media', 'baja']

const ESTADOS = ['por hacer', 'en progreso', 'completado']

const EMPTY = {
  sp:          null,
  prioridad:   '',
  sprint:      '',
  estado:      'por hacer',
  responsable: '',
}

/** 'Alta' → 'alta', 'En progreso' → 'en progreso', 'Hecho' → 'completado' */
function normalizeEstado(e) {
  if (!e) return 'por hacer'
  const m = { 'hecho': 'completado', 'en progreso': 'en progreso', 'por hacer': 'por hacer' }
  return m[e.toLowerCase()] ?? 'por hacer'
}

export default function FormPoker() {
  const { modalPoker, setModalPoker, savePlanHistoria, proyecto } = useApp()
  const { open, historia } = modalPoker

  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!open || !historia) return
    setForm({
      sp:          historia.storyPoints ?? null,
      prioridad:   historia.prioridad?.toLowerCase() ?? '',
      sprint:      historia.sprint      ?? '',
      estado:      normalizeEstado(historia.estado),
      responsable: historia.responsable ?? '',
    })
    setSaving(false)
    setError(null)
  }, [open])

  if (!open || !historia) return null

  const close = () => setModalPoker({ open: false, historia: null })

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const proyectoId = proyecto?.id ?? localStorage.getItem('proyectoActivo')
    const url = `/api/proyectos/${proyectoId}/epicas/${historia.epicaId}/historias/${historia.id}`

    // Payload completo: contenido de la historia + campos de planificación
    const payload = {
      // Campos de contenido requeridos por el PUT
      codigo:               historia.codigo,
      epica_id:             historia.epicaId,
      como:                 historia.rol   ?? '',
      deseo:                historia.deseo ?? '',
      para:                 historia.para  ?? '',
      criterios_aceptacion: historia.criterios ?? undefined,
      // Campos de planificación
      sp:          form.sp,
      prioridad:   form.prioridad    || undefined,
      sprint:      form.sprint !== '' ? Number(form.sprint) : null,
      estado:      form.estado       || undefined,
      responsable: form.responsable.trim() || null,
    }

    console.log('[FormPoker] PUT', url)
    console.log('[FormPoker] payload', payload)

    try {
      await savePlanHistoria(historia, payload)
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
      <div className="modal poker-modal" style={{ maxWidth: 560 }}>

        {/* ── Cabecera ── */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge poker-badge">
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

          {/* ── Story Points — tarjetas vehículo ── */}
          <div className="form-row">
            <label className="form-label">Story Points</label>
            <div className="poker-sp-vehicles">
              {/* Chip para limpiar */}
              <button
                type="button"
                title="Sin estimación"
                className={`poker-sp-card${form.sp === null ? ' selected' : ''}`}
                onClick={() => setForm(f => ({ ...f, sp: null }))}
              >
                <span className="poker-sp-emoji">—</span>
                <span className="poker-sp-num">?</span>
              </button>

              {SP_VEHICLES.map(({ value, emoji, tooltip }) => (
                <button
                  key={value}
                  type="button"
                  title={tooltip}
                  className={`poker-sp-card${form.sp === value ? ' selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, sp: value }))}
                >
                  <span className="poker-sp-emoji">{emoji}</span>
                  <span className="poker-sp-num">{value}</span>
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
                    className={`poker-prio-btn prio-${p}${form.prioridad === p ? ' selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, prioridad: p }))}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
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
                  className={`poker-estado-btn estado-${e.replace(/ /g, '-')}${form.estado === e ? ' selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, estado: e }))}
                >
                  {e.charAt(0).toUpperCase() + e.slice(1)}
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

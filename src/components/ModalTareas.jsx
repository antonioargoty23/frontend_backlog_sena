import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

const TIPOS = [
  { value: 'frontend',      label: 'Frontend',      color: '#2563eb' },
  { value: 'backend',       label: 'Backend',       color: '#7c3aed' },
  { value: 'base_datos',    label: 'Base de datos', color: '#0891b2' },
  { value: 'pruebas',       label: 'Pruebas',       color: '#d97706' },
  { value: 'documentacion', label: 'Docs',          color: '#059669' },
]

const tipoMeta = (v) => TIPOS.find(t => t.value === v) ?? { label: v, color: '#6b7280' }

const FORM_EMPTY = { titulo: '', tipo: 'frontend', responsable_id: '', estado_pct: 0 }

function pctColor(pct) {
  if (pct === 100) return '#10b981'
  if (pct >= 60)   return '#3b82f6'
  if (pct >= 30)   return '#f59e0b'
  return '#6b7280'
}

// ── Mini barra de progreso en la tabla ────────────────────────────────────────
function MiniBar({ pct }) {
  return (
    <div className="tarea-pct-wrap">
      <div className="tarea-pct-bar">
        <div className="tarea-pct-fill" style={{ width: `${pct}%`, background: pctColor(pct) }} />
      </div>
      <span className="tarea-pct-label" style={{ color: pctColor(pct) }}>{pct}%</span>
    </div>
  )
}

// ── Formulario inline (crear o editar) ────────────────────────────────────────
function TareaForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial ?? FORM_EMPTY)
  const [err, setErr]   = useState('')
  const tituloRef       = useRef(null)

  useEffect(() => { tituloRef.current?.focus() }, [])

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setErr('El título es obligatorio'); return }
    setErr('')
    onSave({
      titulo:         form.titulo.trim(),
      tipo:           form.tipo,
      responsable_id: form.responsable_id.trim() || undefined,
      estado_pct:     Number(form.estado_pct),
    })
  }

  return (
    <form className="tarea-inline-form" onSubmit={handleSubmit}>
      <div className="tif-grid">
        {/* Título */}
        <div className="tif-field tif-titulo">
          <label className="tif-label">Título <span className="req-star">*</span></label>
          <input
            ref={tituloRef}
            className={`tif-input${err ? ' tif-invalid' : ''}`}
            type="text"
            value={form.titulo}
            onChange={set('titulo')}
            placeholder="Ej. Diseño pantalla de login"
            maxLength={250}
          />
          {err && <span className="tif-err">{err}</span>}
        </div>

        {/* Tipo */}
        <div className="tif-field tif-tipo">
          <label className="tif-label">Tipo</label>
          <select className="tif-select" value={form.tipo} onChange={set('tipo')}>
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Responsable */}
        <div className="tif-field tif-resp">
          <label className="tif-label">Responsable</label>
          <input
            className="tif-input"
            type="text"
            value={form.responsable_id}
            onChange={set('responsable_id')}
            placeholder="Nombre del integrante"
            maxLength={150}
          />
        </div>

        {/* Avance */}
        <div className="tif-field tif-avance">
          <label className="tif-label">Avance — {form.estado_pct}%</label>
          <div className="tif-slider-wrap">
            <input
              type="range"
              className="tif-slider"
              min="0" max="100" step="5"
              value={form.estado_pct}
              onChange={(e) => setForm(f => ({ ...f, estado_pct: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="tif-actions">
        <button type="button" className="tif-btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="tif-btn-save" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar tarea'}
        </button>
      </div>
    </form>
  )
}

// ── Modal principal ───────────────────────────────────────────────────────────
export default function ModalTareas() {
  const {
    modalTareas, setModalTareas,
    tareas, loadTareasHu,
    addTarea, editTarea, removeTarea,
    askConfirm,
  } = useApp()

  const { open, historia } = modalTareas

  const [showForm,    setShowForm]    = useState(false)
  const [editingId,   setEditingId]   = useState(null)   // ID de tarea en edición
  const [saving,      setSaving]      = useState(false)
  const [loadError,   setLoadError]   = useState(null)

  // Carga tareas al abrir
  useEffect(() => {
    if (!open || !historia) return
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    setLoadError(null)
    loadTareasHu(historia).catch(() => setLoadError('No se pudieron cargar las tareas'))
  }, [open, historia?.id])

  if (!open || !historia) return null

  const close = () => setModalTareas({ open: false, historia: null })
  const huTareas = tareas.filter(t => t.huId === historia.id)

  // Progreso promedio
  const avgPct = huTareas.length
    ? Math.round(huTareas.reduce((s, t) => s + (t.estadoPct ?? t.estado_pct ?? 0), 0) / huTareas.length)
    : 0

  // ── Guardar nueva tarea ──────────────────────────────────────────────────────
  const handleCreate = async (payload) => {
    setSaving(true)
    try {
      await addTarea(historia, payload)
      await loadTareasHu(historia)
      setShowForm(false)
    } catch (e) {
      console.error('[ModalTareas] crear tarea:', e)
    } finally { setSaving(false) }
  }

  // ── Guardar edición ──────────────────────────────────────────────────────────
  const handleUpdate = async (tareaId, payload) => {
    setSaving(true)
    try {
      await editTarea(historia, tareaId, payload)
      await loadTareasHu(historia)
      setEditingId(null)
    } catch (e) {
      console.error('[ModalTareas] editar tarea:', e)
    } finally { setSaving(false) }
  }

  // ── Eliminar tarea ───────────────────────────────────────────────────────────
  const handleDelete = async (tarea) => {
    const ok = await askConfirm({
      title:   `¿Eliminar tarea ${tarea.codigo}?`,
      message: `"${tarea.nombre}" se eliminará definitivamente.`,
    })
    if (!ok) return
    await removeTarea(historia, tarea.id)
    await loadTareasHu(historia)
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="modal tareas-modal">

        {/* ── Cabecera ── */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge" style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <line x1="8" y1="6"  x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <polyline points="3 6 4 7 6 5"/>
                <polyline points="3 12 4 13 6 11"/>
                <polyline points="3 18 4 19 6 17"/>
              </svg>
            </span>
            Tareas ·{' '}
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--sena-green)', fontSize: 13 }}>
              {historia.codigo}
            </span>
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12, marginLeft: 6 }}>
              {historia.rol ? `Como ${historia.rol}` : historia.nombre}
            </span>
          </div>
          <button className="close-btn" onClick={close}>✕</button>
        </div>

        {/* ── Barra de progreso global ── */}
        <div className="tm-progress-header">
          <div className="tm-progress-info">
            <span className="tm-progress-label">Progreso general</span>
            <span className="tm-progress-pct" style={{ color: pctColor(avgPct) }}>{avgPct}%</span>
          </div>
          <div className="tm-progress-bar">
            <div
              className="tm-progress-fill"
              style={{ width: `${avgPct}%`, background: pctColor(avgPct) }}
            />
          </div>
          <div className="tm-progress-meta">
            {huTareas.length} tarea{huTareas.length !== 1 ? 's' : ''}
            {huTareas.length > 0 && ` · ${huTareas.filter(t => (t.estadoPct ?? 0) === 100).length} completada(s)`}
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="modal-body tm-body">

          {loadError && (
            <div className="tm-load-error">{loadError}</div>
          )}

          {/* ── Tabla de tareas ── */}
          {huTareas.length === 0 && !showForm ? (
            <div className="tm-empty">
              <span className="tm-empty-icon">📋</span>
              <p>Sin tareas aún — crea la primera abajo</p>
            </div>
          ) : (
            <div className="tm-table-wrap">
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th style={{ minWidth: 200 }}>Título</th>
                    <th style={{ width: 110 }}>Tipo</th>
                    <th style={{ width: 130 }}>Responsable</th>
                    <th style={{ width: 140 }}>Avance</th>
                    <th style={{ width: 80, textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {huTareas.map(t => (
                    editingId === t.id ? (
                      // ── Fila en modo edición ──
                      <tr key={t.id} className="tm-row-editing">
                        <td colSpan={6} style={{ padding: '4px 10px' }}>
                          <TareaForm
                            initial={{
                              titulo:         t.nombre,
                              tipo:           t.tipo ?? 'frontend',
                              responsable_id: t.responsable ?? '',
                              estado_pct:     t.estadoPct ?? t.estado_pct ?? 0,
                            }}
                            onSave={(payload) => handleUpdate(t.id, payload)}
                            onCancel={() => setEditingId(null)}
                            saving={saving}
                          />
                        </td>
                      </tr>
                    ) : (
                      // ── Fila normal ──
                      <tr key={t.id} className="tm-row">
                        <td className="tm-td-id">{t.codigo}</td>
                        <td className="tm-td-title">{t.nombre}</td>
                        <td>
                          <span
                            className="tm-tipo-badge"
                            style={{ '--tipo-color': tipoMeta(t.tipo).color }}
                          >
                            {tipoMeta(t.tipo).label}
                          </span>
                        </td>
                        <td className="tm-td-resp">
                          {t.responsable || <span className="td-muted">—</span>}
                        </td>
                        <td><MiniBar pct={t.estadoPct ?? t.estado_pct ?? 0} /></td>
                        <td>
                          <div className="row-actions" style={{ opacity: 1, justifyContent: 'center' }}>
                            <button
                              className="bl-btn-icon"
                              title="Editar tarea"
                              onClick={() => { setShowForm(false); setEditingId(t.id) }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="bl-btn-icon danger"
                              title="Eliminar tarea"
                              onClick={() => handleDelete(t)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Formulario nueva tarea (expandible) ── */}
          {showForm && !editingId && (
            <div className="tm-new-form-wrap">
              <div className="tm-new-form-title">Nueva tarea</div>
              <TareaForm
                initial={FORM_EMPTY}
                onSave={handleCreate}
                onCancel={() => setShowForm(false)}
                saving={saving}
              />
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          {!showForm && !editingId && (
            <button
              className="tm-btn-add"
              onClick={() => { setEditingId(null); setShowForm(true) }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" width="13" height="13">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nueva tarea
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button className="btn-modal-cancel" onClick={close}>Cerrar</button>
        </div>

      </div>
    </div>
  )
}

import { useRef, useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import FichaSelector from './FichaSelector'
import '../styles/Subheader.css'

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Subheader() {
  const { proyecto, syncProyecto, updateInfoProyecto } = useApp()
  const { usuario } = useAuth()
  const esInstructor = usuario?.rol?.nombre === 'instructor'

  const nombreRef = useRef()
  const duenoRef  = useRef()

  const handleBlur = () =>
    syncProyecto(nombreRef.current.value, duenoRef.current.value)

  // ── Panel info ───────────────────────────────────────────────
  const [panelOpen, setPanelOpen] = useState(false)
  const [form, setForm]   = useState({ nombre: '', descripcion: '', ficha_id: '', integrantes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (panelOpen) {
      setForm({
        nombre:      proyecto.nombre       ?? '',
        descripcion: proyecto.descripcion  ?? '',
        ficha_id:    proyecto.fichaId      ?? '',
        integrantes: proyecto.integrantes  ?? '',
      })
      setSaving(false)
    }
  }, [panelOpen, proyecto.nombre, proyecto.descripcion, proyecto.fichaId, proyecto.integrantes])

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return
    setSaving(true)
    try {
      await updateInfoProyecto({
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        integrantes: form.integrantes.trim(),
        ...(form.ficha_id ? { ficha_id: Number(form.ficha_id) } : {}),
      })
      setPanelOpen(false)
    } catch {
      setSaving(false)
    }
  }

  const fichaLabel = proyecto.ficha
    ? `${proyecto.ficha.codigo ?? proyecto.fichaId} · ${proyecto.ficha.nombre ?? ''}`
    : proyecto.fichaId ? String(proyecto.fichaId) : '—'

  return (
    <>
      <div className="app-subheader">
        <div className="subheader-field">
          <div className="subheader-label">Proyecto</div>
          <div className="subheader-value">
            <input
              ref={nombreRef}
              type="text"
              defaultValue={proyecto.nombre}
              placeholder="Nombre del proyecto…"
              onBlur={handleBlur}
            />
            <button className="edit-icon" title="Editar" onClick={() => nombreRef.current.focus()}>
              <EditIcon />
            </button>
          </div>
        </div>

        <div className="subheader-sep" />

        <div className="subheader-field">
          <div className="subheader-label">Dueño / Product Owner</div>
          <div className="subheader-value">
            <input
              ref={duenoRef}
              type="text"
              defaultValue={proyecto.dueno}
              placeholder="Nombre del responsable…"
              onBlur={handleBlur}
            />
            <button className="edit-icon" title="Editar" onClick={() => duenoRef.current.focus()}>
              <EditIcon />
            </button>
          </div>
        </div>

        <button
          className={`project-info-toggle${panelOpen ? ' open' : ''}`}
          onClick={() => setPanelOpen(v => !v)}
        >
          Ver información del proyecto
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {panelOpen && (
        <div className="project-info-panel">
          <div className="pip-grid">

            {/* Nombre */}
            <div className="pip-field pip-field--span2">
              <div className="pip-label">Nombre del proyecto</div>
              {esInstructor ? (
                <input
                  className="pip-input"
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Nombre del proyecto…"
                  maxLength={100}
                />
              ) : (
                <div className="pip-value">{proyecto.nombre || '—'}</div>
              )}
            </div>

            {/* Ficha asociada */}
            <div className="pip-field">
              <div className="pip-label">Ficha asociada</div>
              {esInstructor ? (
                <FichaSelector
                  value={form.ficha_id}
                  onChange={id => setForm(f => ({ ...f, ficha_id: id }))}
                />
              ) : (
                <div className="pip-value">{fichaLabel}</div>
              )}
            </div>

            {/* Descripción */}
            <div className="pip-field pip-field--span2">
              <div className="pip-label">Descripción</div>
              {esInstructor ? (
                <textarea
                  className="pip-input pip-textarea"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Descripción del proyecto…"
                  maxLength={250}
                />
              ) : (
                <div className="pip-value">{proyecto.descripcion || '—'}</div>
              )}
            </div>

            {/* Integrantes */}
            <div className="pip-field">
              <div className="pip-label">Integrantes del equipo</div>
              {esInstructor ? (
                <textarea
                  className="pip-input pip-textarea"
                  value={form.integrantes}
                  onChange={e => setForm(f => ({ ...f, integrantes: e.target.value }))}
                  placeholder="Adriana Eraso, Sara Campo, Andrea Eraso…"
                />
              ) : (
                <div className="pip-value">{proyecto.integrantes || '—'}</div>
              )}
            </div>

            {/* Dueño */}
            <div className="pip-field">
              <div className="pip-label">Dueño / Product Owner</div>
              <div className="pip-value">{proyecto.dueno || '—'}</div>
            </div>

            {/* Fecha */}
            <div className="pip-field">
              <div className="pip-label">Fecha de creación</div>
              <div className="pip-value">{formatFecha(proyecto.creadoEn)}</div>
            </div>

          </div>

          {esInstructor && (
            <div className="pip-footer">
              <button className="pip-cancel" onClick={() => setPanelOpen(false)}>
                Cancelar
              </button>
              <button
                className="pip-save"
                onClick={handleGuardar}
                disabled={saving || !form.nombre.trim()}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {!esInstructor && (
            <div className="pip-footer pip-footer--readonly">
              <button className="pip-cancel" onClick={() => setPanelOpen(false)}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

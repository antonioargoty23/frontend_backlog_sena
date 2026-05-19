import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProyectos, createProyecto } from '../api/proyectos'
import { createUsuario } from '../api/usuarios'
import FichaSelector from '../components/FichaSelector'
import '../styles/proyectos.css'
import PropTypes from 'prop-types'

const MODAL_EMPTY = { nombre: '', descripcion: '', ficha_id: '', dueno: '', integrantes: '' }

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

function ModalNuevoInstructor({ onCreated, onClose }) {
  const [form, setForm]     = useState({ nombre: '', apellido: '', email: '', password: 'password123', ficha_id: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.nombre.trim())   errs.nombre   = 'El nombre es obligatorio.'
    if (!form.apellido.trim()) errs.apellido = 'El apellido es obligatorio.'
    if (!form.email.trim())    errs.email    = 'El correo es obligatorio.'
    if (!form.password)        errs.password = 'La contraseña es obligatoria.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        nombre:   form.nombre.trim(),
        apellido: form.apellido.trim(),
        email:    form.email.trim(),
        password: form.password,
        ...(form.ficha_id ? { ficha_id: Number(form.ficha_id) } : {}),
      }
      const res = await createUsuario(payload)
      onCreated(res.data?.data ?? res.data)
    } catch {
      setSaving(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="modal-overlay open"
      style={{ zIndex: 1100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal" style={{ maxWidth: 460 }} onKeyDown={handleKey}>

        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>IN</span>
            Nuevo Instructor
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          <div className="form-grid">
            <div className="form-row">
              <label className="form-label req">Nombre</label>
              <input
                className={`form-input${errors.nombre ? ' invalid' : ''}`}
                type="text"
                value={form.nombre}
                onChange={set('nombre')}
                placeholder="Ej. Carlos"
                maxLength={100}
                autoFocus
              />
              <ErrMsg msg={errors.nombre} />
            </div>
            <div className="form-row">
              <label className="form-label req">Apellido</label>
              <input
                className={`form-input${errors.apellido ? ' invalid' : ''}`}
                type="text"
                value={form.apellido}
                onChange={set('apellido')}
                placeholder="Ej. Ramírez"
                maxLength={100}
              />
              <ErrMsg msg={errors.apellido} />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label req">Correo electrónico</label>
            <input
              className={`form-input${errors.email ? ' invalid' : ''}`}
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="instructor@sena.edu.co"
              maxLength={150}
            />
            <ErrMsg msg={errors.email} />
          </div>

          <div className="form-row">
            <label className="form-label req">Contraseña inicial</label>
            <input
              className={`form-input${errors.password ? ' invalid' : ''}`}
              type="text"
              value={form.password}
              onChange={set('password')}
              placeholder="password123"
              maxLength={100}
            />
            <ErrMsg msg={errors.password} />
          </div>

          <div className="form-row">
            <label className="form-label">Rol</label>
            <input className="form-input" type="text" value="Instructor" disabled />
          </div>

          <div className="form-row">
            <label className="form-label">Ficha asignada</label>
            <FichaSelector
              value={form.ficha_id}
              onChange={id => setForm(f => ({ ...f, ficha_id: id }))}
            />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear instructor'}
          </button>
        </div>

      </div>
    </div>
  )
}

function ModalNuevoProyecto({ onCreated, onClose }) {
  const { usuario }         = useAuth()
  const [form, setForm]     = useState(MODAL_EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre   = 'El nombre es obligatorio.'
    if (!form.dueno.trim())  errs.dueno    = 'El dueño es obligatorio.'
    if (!form.ficha_id)      errs.ficha_id = 'Selecciona una ficha.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await createProyecto({
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        integrantes: form.integrantes.trim(),
        dueno:       form.dueno.trim(),
        ficha_id:    Number(form.ficha_id),
        dueno_id:    usuario.id,
      })
      onCreated()
    } catch {
      setSaving(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal modal-nuevo-proyecto" onKeyDown={handleKey}>

        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-title-badge ep">PR</span>
            Nuevo Proyecto
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Nombre */}
          <div className="form-row">
            <div className="form-label-row">
              <label className="form-label req">Nombre del proyecto</label>
              <span className={`form-char-count${form.nombre.length > 90 ? ' at-max' : form.nombre.length > 70 ? ' near' : ''}`}>
                {form.nombre.length}/100
              </span>
            </div>
            <input
              className={`form-input${errors.nombre ? ' invalid' : ''}`}
              type="text"
              value={form.nombre}
              onChange={set('nombre')}
              placeholder="Ej. Sistema de gestión académica SENA"
              maxLength={100}
              autoFocus
            />
            <ErrMsg msg={errors.nombre} />
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
              placeholder="Describe brevemente el objetivo del proyecto…"
              maxLength={250}
              style={{ minHeight: 72 }}
            />
          </div>

          {/* Dueño / Product Owner */}
          <div className="form-row">
            <label className="form-label req">Dueño / Product Owner</label>
            <input
              className={`form-input${errors.dueno ? ' invalid' : ''}`}
              type="text"
              value={form.dueno}
              onChange={set('dueno')}
              placeholder="Nombre del Product Owner"
            />
            <ErrMsg msg={errors.dueno} />
          </div>

          {/* Ficha */}
          <div className="form-row">
            <label className="form-label req">Ficha del programa</label>
            <FichaSelector
              value={form.ficha_id}
              onChange={id => setForm(f => ({ ...f, ficha_id: id }))}
              invalid={!!errors.ficha_id}
            />
            <ErrMsg msg={errors.ficha_id} />
          </div>

          {/* Integrantes */}
          <div className="form-row">
            <label className="form-label">Integrantes del equipo</label>
            <textarea
              className="form-textarea"
              value={form.integrantes}
              onChange={set('integrantes')}
              placeholder="Adriana Eraso, Sara Campo, Andrea Eraso…"
              style={{ minHeight: 64 }}
            />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear proyecto'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function ProyectosPage() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()

  const [proyectos, setProyectos] = useState([])
  const [filtro, setFiltro]       = useState('')
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const esInstructor = usuario?.rol?.nombre === 'instructor'

  const cargarProyectos = useCallback(() => {
    setCargando(true)
    getProyectos()
      .then(res => setProyectos(res.data?.data ?? []))
      .catch(() => setError('No se pudieron cargar los proyectos.'))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargarProyectos() }, [cargarProyectos])

  const proyectosFiltrados = proyectos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.ficha?.codigo ?? '').includes(filtro)
  )

  return (
    <div className="proyectos-page">

      {/* ── Subheader ── */}
      <div className="proyectos-subheader">
        <div className="proyectos-subheader-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
        </div>
        <div>
          <div className="proyectos-subheader-title">Proyectos</div>
          <div className="proyectos-subheader-sub">Gestión de backlogs del proyecto formativo</div>
        </div>

        <div className="proyectos-subheader-actions">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Dashboard
          </button>

          {esInstructor && (
            <button className="dash-nuevo-btn" onClick={() => setModalOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo Proyecto
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="proyectos-body">

        <div className="proyectos-toolbar">
          <input
            className="proyectos-search"
            type="text"
            placeholder="Buscar por nombre o ficha…"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
          <span className="proyectos-count">
            {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {cargando && (
          <div className="dash-loading">Cargando proyectos…</div>
        )}

        {error && (
          <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>
        )}

        {!cargando && !error && proyectosFiltrados.length === 0 && (
          <div className="proyectos-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
            <h3>{filtro ? 'Sin resultados' : 'Sin proyectos'}</h3>
            <p>
              {filtro
                ? `No hay proyectos que coincidan con "${filtro}".`
                : esInstructor
                  ? 'Crea el primer proyecto con el botón "Nuevo Proyecto".'
                  : 'Tu instructor aún no ha creado un proyecto para tu ficha.'}
            </p>
          </div>
        )}

        {!cargando && proyectosFiltrados.length > 0 && (
          <div className="proyectos-list">
            {proyectosFiltrados.map(p => (
              <div key={p.id} className="proyecto-row">

                <div className="proyecto-row-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                  </svg>
                </div>

                <div className="proyecto-row-info">
                  <div className="proyecto-row-name">{p.nombre}</div>
                  <div className="proyecto-row-meta">
                    <span className="proyecto-ficha-chip">{p.ficha?.codigo ?? `Ficha ${p.fichaId}`}</span>
                    <span className="proyecto-row-meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {p.dueno || 'Sin dueño'}
                    </span>
                    {p.descripcion && (
                      <span className="proyecto-row-meta-item">{p.descripcion}</span>
                    )}
                  </div>
                </div>

                <div className="proyecto-row-actions">
                  <button
                    className="btn-ver-backlog"
                    onClick={() => navigate(`/proyectos/${p.id}`)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    Ver Backlog
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {modalOpen && (
        <ModalNuevoProyecto
          onCreated={() => { setModalOpen(false); cargarProyectos() }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

ModalNuevoInstructor.propTypes = {
  onCreated: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

ModalNuevoProyecto.propTypes = {
  onCreated: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

ErrMsg.propTypes = {
  msg: PropTypes.string,
}
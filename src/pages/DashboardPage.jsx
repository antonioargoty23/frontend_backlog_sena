import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProyectos } from '../api/proyectos'
import { createUsuario } from '../api/usuarios'
import FichaSelector from '../components/FichaSelector'
import logoSena from '../assets/logoSena.png'
import '../styles/dashboard.css'

const USUARIO_EMPTY = { nombre: '', apellido: '', email: '', documento: '', password: 'password123', rol: 'instructor', ficha_id: '' }

function ModalNuevoUsuario({ onClose, onCreado }) {
  const [form, setForm]     = useState(USUARIO_EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())    e.nombre    = 'Requerido'
    if (!form.apellido.trim())  e.apellido  = 'Requerido'
    if (!form.email.trim())     e.email     = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.documento.trim()) e.documento = 'Requerido'
    if (!form.password)         e.password  = 'Requerido'
    return e
  }

  const handleGuardar = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await createUsuario({
        nombre:    form.nombre.trim(),
        apellido:  form.apellido.trim(),
        email:     form.email.trim(),
        documento: form.documento.trim(),
        password:  form.password,
        rol:       form.rol,
        ...(form.ficha_id ? { ficha_id: Number(form.ficha_id) } : {}),
      })
      onCreado()
      onClose()
    } catch (err) {
      const apiErrors = err?.response?.data?.errors
      if (apiErrors?.length) {
        const mapped = {}
        apiErrors.forEach(e => { mapped[e.field] = e.message })
        setErrors(mapped)
      }
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Nuevo usuario</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Nombre *</label>
              <input className={`form-input${errors.nombre ? ' invalid' : ''}`} value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>
            <div className="form-row">
              <label className="form-label">Apellido *</label>
              <input className={`form-input${errors.apellido ? ' invalid' : ''}`} value={form.apellido} onChange={e => set('apellido', e.target.value)} />
              {errors.apellido && <span className="form-error">{errors.apellido}</span>}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Correo electrónico *</label>
              <input className={`form-input${errors.email ? ' invalid' : ''}`} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-row">
              <label className="form-label">Documento *</label>
              <input className={`form-input${errors.documento ? ' invalid' : ''}`} value={form.documento} onChange={e => set('documento', e.target.value)} />
              {errors.documento && <span className="form-error">{errors.documento}</span>}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Contraseña *</label>
              <input className={`form-input${errors.password ? ' invalid' : ''}`} type="text" value={form.password} onChange={e => set('password', e.target.value)} />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-row">
              <label className="form-label">Rol</label>
              <select className="form-select" value={form.rol} onChange={e => set('rol', e.target.value)}>
                <option value="instructor">Instructor</option>
                <option value="aprendiz">Aprendiz</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Ficha del programa</label>
            <FichaSelector value={form.ficha_id} onChange={id => set('ficha_id', id)} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn-modal-save" onClick={handleGuardar} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [proyectos, setProyectos]         = useState([])
  const [cargando, setCargando]           = useState(true)
  const [error, setError]                 = useState(null)
  const [modalUsuario, setModalUsuario]   = useState(false)
  const [toastMsg, setToastMsg]           = useState(null)

  const esInstructor = usuario?.rol?.nombre === 'instructor'

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2800) }
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : ''
  const fichaCodigo = usuario?.ficha?.codigo ?? ''

  useEffect(() => {
    getProyectos()
      .then(res => setProyectos(res.data?.data ?? []))
      .catch(() => setError('No se pudieron cargar los proyectos.'))
      .finally(() => setCargando(false))
  }, [])

  const handleUsuarioCreado = () => showToast('✔ Usuario creado correctamente')

  return (
    <div className="dashboard-page">

      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-brand">
          <img src={logoSena} alt="SENA" />
          <div>
            <div className="dash-brand-name">SENA <strong>CTPI</strong></div>
            <div className="dash-brand-sub">Product Backlog del Proyecto Formativo</div>
          </div>
        </div>

        <div className="dash-header-right">
          {esInstructor && (
            <button className="dash-nuevo-btn" onClick={() => navigate('/admin')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              Administración
            </button>
          )}
          {esInstructor && (
            <button className="dash-nuevo-btn" onClick={() => setModalUsuario(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo usuario
            </button>
          )}
          <div className="dash-user-chip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--text-on-dark-muted)' }}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="dash-user-name">{nombreCompleto}</span>
            <span className={`dash-role-badge ${esInstructor ? 'instructor' : 'aprendiz'}`}>
              {esInstructor ? 'Instructor' : 'Aprendiz'}
            </span>
          </div>

          <button className="dash-logout-btn" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="dash-body">

        {/* Bienvenida */}
        <div className="dash-welcome">
          <div className="dash-welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div className="dash-welcome-title">Bienvenido, {usuario?.nombre}</div>
            <div className="dash-welcome-sub">
              {esInstructor
                ? `Instructor · Ficha ${fichaCodigo}`
                : `Aprendiz · Ficha ${fichaCodigo}`}
              {' · '}{usuario?.email}
            </div>
          </div>
        </div>

        {/* Proyectos */}
        <div>
          <div className="dash-section-header">
            <span className="dash-section-title">
              {esInstructor ? 'Proyectos de mi ficha' : 'Mi proyecto'}
            </span>
            {esInstructor && (
              <button className="dash-nuevo-btn" onClick={() => navigate('/proyectos')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Gestionar proyectos
              </button>
            )}
          </div>

          {cargando && <div className="dash-loading">Cargando proyectos…</div>}

          {error && <div className="login-error">{error}</div>}

          {!cargando && !error && proyectos.length === 0 && (
            <div className="dash-empty">
              <h3>Sin proyectos</h3>
              <p>
                {esInstructor
                  ? 'Crea el primer proyecto desde "Gestionar proyectos".'
                  : 'Tu instructor aún no ha creado un proyecto para tu ficha.'}
              </p>
            </div>
          )}

          {!cargando && proyectos.length > 0 && (
            <div className="projects-grid">
              {proyectos.map(p => (
                <div key={p.id} className="project-card">
                  <div className="project-card-head">
                    <span className="project-ficha-badge">{p.ficha?.codigo ?? `F${p.fichaId}`}</span>
                    <span className="project-card-name">{p.nombre}</span>
                  </div>

                  <div className="project-card-body">
                    {p.descripcion && (
                      <p className="project-card-desc">{p.descripcion}</p>
                    )}
                    <div className="project-card-owner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {p.dueno || 'Sin dueño asignado'}
                    </div>
                  </div>

                  <div className="project-card-footer">
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

      </div>

      {modalUsuario && (
        <ModalNuevoUsuario
          onClose={() => setModalUsuario(false)}
          onCreado={handleUsuarioCreado}
        />
      )}

      <div className={`toast${toastMsg ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  )
}

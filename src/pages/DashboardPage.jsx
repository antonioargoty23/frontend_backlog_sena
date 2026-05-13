import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProyectos } from '../api/proyectos'
import logoSena from '../assets/logoSena.png'
import '../styles/dashboard.css'

export default function DashboardPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const esInstructor = usuario?.rol?.nombre === 'instructor'
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : ''
  const fichaCodigo = usuario?.ficha?.codigo ?? ''

  useEffect(() => {
    getProyectos()
      .then(res => setProyectos(res.data?.data ?? []))
      .catch(() => setError('No se pudieron cargar los proyectos.'))
      .finally(() => setCargando(false))
  }, [])

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
    </div>
  )
}

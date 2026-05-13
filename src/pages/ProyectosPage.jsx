import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProyectos } from '../api/proyectos'
import '../styles/proyectos.css'

export default function ProyectosPage() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()

  const [proyectos, setProyectos] = useState([])
  const [filtro, setFiltro]       = useState('')
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const esInstructor = usuario?.rol?.nombre === 'instructor'

  useEffect(() => {
    getProyectos()
      .then(res => setProyectos(res.data?.data ?? []))
      .catch(() => setError('No se pudieron cargar los proyectos.'))
      .finally(() => setCargando(false))
  }, [])

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
            <button className="dash-nuevo-btn" onClick={() => navigate('/dashboard')}>
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

        {/* Toolbar */}
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

        {/* Lista */}
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
    </div>
  )
}

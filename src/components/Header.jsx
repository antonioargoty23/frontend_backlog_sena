import { useNavigate } from 'react-router-dom'
import logoSena from '../assets/logoSena.png'
import { useApp } from '../context/AppContext'
import { descargarExcel } from '../api/proyectos'
import '../styles/Header.css'

export default function Header() {
  const navigate = useNavigate()
  const {
    proyecto,
    sidebarCollapsed, setSidebarCollapsed,
    vistaActual, setVistaActual,
    setModalEpica, setModalHU,
  } = useApp()

  const handleExcel = () => {
    if (proyecto.id) descargarExcel(proyecto.id).catch(console.error)
  }

  return (
    <header className="app-header">
      <div className={`header-brand${sidebarCollapsed ? ' collapsed' : ''}`}>
        <img src={logoSena} alt="SENA" className="brand-logo" />
        <div className="brand-text">
          <div className="brand-name">SENA <strong>CTPI</strong></div>
          <div className="brand-subtitle">PRODUCT BACKLOG DEL PROYECTO FORMATIVO</div>
        </div>
      </div>

      <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(v => !v)} title="Expandir/colapsar panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <nav className="header-nav">
        <button className={`nav-tab${vistaActual === 'backlog' ? ' active' : ''}`} onClick={() => setVistaActual('backlog')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Product Backlog
        </button>
        <button className={`nav-tab${vistaActual === 'tareas' ? ' active' : ''}`} onClick={() => setVistaActual('tareas')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          Tareas
        </button>
      </nav>

      <div className="header-actions">
        <button className="btn-header btn-epica" onClick={() => setModalEpica({ open: true })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="15" height="15">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Épica
        </button>
        <button className="btn-header btn-historia" onClick={() => setModalHU({ open: true, editData: null, epicaId: null })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="15" height="15">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Historia
        </button>
        <button className="btn-header btn-xlsx" onClick={handleExcel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar .xlsx
        </button>

        <div className="header-icons">
          <button className="icon-btn" title="Volver a proyectos" onClick={() => navigate('/proyectos')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

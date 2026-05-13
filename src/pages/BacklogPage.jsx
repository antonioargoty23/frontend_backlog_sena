import { useApp } from '../context/AppContext'
import Header from '../components/Header'
import Subheader from '../components/Subheader'
import Sidebar from '../components/Sidebar'
import StatsGrid from '../components/StatsGrid'
import EpicaSection from '../components/EpicaSection'
import TareaCard from '../components/TareaCard'
import ModalEpica from '../components/ModalEpica'
import ModalHU from '../components/ModalHU'
import ModalTarea from '../components/ModalTarea'
import Toast from '../components/Toast'
import '../styles/Backlog.css'
import '../styles/Tareas.css'

export default function BacklogPage() {
  const {
    epicas, historias, tareas,
    vistaActual, huSeleccionada, setHuSeleccionada,
    setModalTarea, loading,
  } = useApp()

  const huActual = historias.find(h => h.id === huSeleccionada)
  const tareasHU = tareas.filter(t => t.huId === huSeleccionada)

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Cargando…
      </div>
    )
  }

  return (
    <>
      <Header />
      <Subheader />

      <div className="app-body">
        <Sidebar />

        {/* ── Vista: Product Backlog ── */}
        <div className={`view${vistaActual === 'backlog' ? ' active' : ''}`}>
          <div className="app-main">
            <div className="backlog-content">
              <div>
                <div className="backlog-title-row">
                  <div className="backlog-title-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="backlog-title">Backlog del producto</div>
                    <div className="backlog-subtitle">Vista construida automáticamente al editar</div>
                  </div>
                </div>
              </div>

              <StatsGrid />

              {epicas.map(ep => <EpicaSection key={ep.id} epica={ep} />)}
            </div>
          </div>
        </div>

        {/* ── Vista: Tareas ── */}
        <div className={`view${vistaActual === 'tareas' ? ' active' : ''}`}>
          <div className="tareas-layout">

            {/* Sidebar historias */}
            <div className="tareas-sidebar">
              <div className="sidebar-title" style={{ marginBottom: 10 }}>Historias de usuario</div>
              {historias.map(h => {
                const ep = epicas.find(e => e.id === h.epicaId)
                return (
                  <div
                    key={h.id}
                    className={`hu-selector-item${huSeleccionada === h.id ? ' selected' : ''}`}
                    onClick={() => setHuSeleccionada(h.id)}
                  >
                    <div className="hu-sel-id">{h.codigo ?? h.id}</div>
                    <div className="hu-sel-name">{h.nombre}</div>
                    <div className="hu-sel-epica">
                      {ep ? `${ep.codigo ?? ep.id} · ${ep.titulo.substring(0, 28)}…` : ''}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Contenido tareas */}
            <div className="tareas-main">
              {!huActual ? (
                <div className="empty-state">
                  <div className="es-icon">⚙️</div>
                  <h3>Selecciona una historia de usuario</h3>
                  <p>Verás aquí las tareas asociadas y podrás agregar nuevas.</p>
                </div>
              ) : (
                <>
                  <div className="tareas-header-card">
                    <div>
                      <h2>
                        <span style={{ color: 'var(--sena-green)', fontFamily: 'var(--font-mono)' }}>
                          {huActual.codigo ?? huActual.id}
                        </span>
                        {' · '}{huActual.nombre}
                      </h2>
                      <p>Como {huActual.rol} · Épica: {huActual.epicaId} · {tareasHU.length} tarea(s)</p>
                    </div>
                    <button
                      className="btn-header btn-epica"
                      onClick={() => setModalTarea({ open: true })}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="15" height="15">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Tarea
                    </button>
                  </div>

                  {tareasHU.length === 0 ? (
                    <div className="empty-state">
                      <div className="es-icon">📋</div>
                      <h3>Sin tareas aún</h3>
                      <p>Agrega la primera tarea para esta historia.</p>
                    </div>
                  ) : (
                    tareasHU.map(t => <TareaCard key={t.id} tarea={t} hu={huActual} />)
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalEpica />
      <ModalHU />
      <ModalTarea />
      <Toast />
    </>
  )
}

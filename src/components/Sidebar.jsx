import { useState } from 'react'
import { useApp } from '../context/AppContext'
import '../styles/Sidebar.css'

export default function Sidebar() {
  const {
    epicas, historias, sidebarCollapsed,
    setModalEpica, setModalHU, setVistaActual, setHuSeleccionada,
  } = useApp()

  const [openEpicas, setOpenEpicas] = useState({})

  const toggleEpica = (id) =>
    setOpenEpicas(prev => ({ ...prev, [id]: !prev[id] }))

  const handleClickHU = (hu) => {
    setHuSeleccionada(hu.id)
    setVistaActual('tareas')
  }

  return (
    <aside className={`app-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-inner">
        <div className="sidebar-header">
          <span className="sidebar-title">Épicas e Historias</span>
          <button className="sidebar-filter-btn" title="Filtrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="sidebar-body">
          {epicas.map(ep => {
            const hus = historias.filter(h => h.epicaId === ep.id)
            const isOpen = openEpicas[ep.id] !== false

            return (
              <div key={ep.id} className="sidebar-epica">
                <div className="sidebar-epica-header" onClick={() => toggleEpica(ep.id)}>
                  <span className="epica-badge-sm">{ep.codigo ?? ep.id}</span>
                  <span className="sidebar-epica-name">{ep.titulo}</span>
                  <span className="sidebar-epica-count">{hus.length}</span>
                  <span className={`sidebar-chevron${isOpen ? ' open' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>

                <div className={`sidebar-hu-list${isOpen ? ' open' : ''}`}>
                  {hus.map(h => (
                    <div key={h.id} className="sidebar-hu-item" onClick={() => handleClickHU(h)}>
                      <span className="hu-badge-sm">{h.codigo ?? h.id}</span>
                      <span className="hu-preview-text">
                        Como {h.rol}, {(h.deseo ?? '').substring(0, 50)}…
                      </span>
                    </div>
                  ))}
                  <button
                    className="sidebar-add-hu"
                    onClick={() => setModalHU({ open: true, editData: null, epicaId: ep.id })}
                  >
                    + Historia
                  </button>
                </div>
              </div>
            )
          })}

          <button className="sidebar-add-epica" onClick={() => setModalEpica({ open: true })}>
            + Agregar épica
          </button>
        </div>
      </div>
    </aside>
  )
}

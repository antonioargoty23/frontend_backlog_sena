import { useRef } from 'react'
import { useApp } from '../context/AppContext'
import '../styles/Subheader.css'

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export default function Subheader() {
  const { proyecto, syncProyecto } = useApp()
  const nombreRef = useRef()
  const duenoRef  = useRef()

  const handleBlur = () =>
    syncProyecto(nombreRef.current.value, duenoRef.current.value)

  return (
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

      <button className="project-info-toggle">
        Ver información del proyecto
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>
  )
}

import { useApp } from '../context/AppContext'

export default function TareaCard({ tarea, hu }) {
  const { removeTarea } = useApp()
  const isRNF = tarea.tipo?.includes('RNF')

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar tarea ${tarea.codigo ?? tarea.id}?`)) return
    removeTarea(hu, tarea.id)
  }

  return (
    <div className="tarea-card">
      <div className="tarea-card-head">
        <span className="tarea-id-badge">{tarea.codigo ?? tarea.id}</span>
        <span className="tarea-nombre">{tarea.nombre}</span>
        <span className={isRNF ? 'badge-rnf' : 'badge-rf'}>{tarea.tipo}</span>
        <button
          className="row-menu-btn"
          title="Eliminar"
          style={{ color: 'var(--priority-alta-text)' }}
          onClick={handleDelete}
        >✕</button>
      </div>

      <div className="tarea-card-body">
        <div className="tarea-field">
          <div className="tf-label">Responsable</div>
          <div className="tf-val">{tarea.responsable || '—'}</div>
        </div>
        <div className="tarea-field">
          <div className="tf-label">Estimación</div>
          <div className="tf-val">{tarea.estimacion ? `${tarea.estimacion} día(s)` : '—'}</div>
        </div>
        <div className="tarea-field">
          <div className="tf-label">Prioridad</div>
          <div className="tf-val">{tarea.prioridad}</div>
        </div>
        <div className="tarea-field-full">
          <div className="tf-label">
            Avance · {tarea.estado || 0}%
            {tarea.dependencias && (
              <span style={{ marginLeft: 12, color: 'var(--text-muted)' }}>
                Depende de: <strong>{tarea.dependencias}</strong>
              </span>
            )}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${tarea.estado || 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

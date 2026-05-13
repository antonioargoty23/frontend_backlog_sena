import { useApp } from '../context/AppContext'

function prioBadge(p) {
  if (!p) return null
  const l = p.toLowerCase()
  if (l === 'alta')  return <span className="badge badge-alta">Alta</span>
  if (l === 'media') return <span className="badge badge-media">Media</span>
  return <span className="badge badge-baja">Baja</span>
}

function estadoBadge(e) {
  if (!e) return null
  if (e === 'En progreso') return <span className="badge badge-progreso">En progreso</span>
  if (e === 'Hecho')       return <span className="badge badge-hecho">Hecho</span>
  return <span className="badge badge-hacer">Por hacer</span>
}

export default function EpicaSection({ epica }) {
  const { historias, setModalHU } = useApp()
  const hus = historias.filter(h => h.epicaId === epica.id)
  const sp  = hus.reduce((s, h) => s + (parseInt(h.sp) || 0), 0)
  const codigo = epica.codigo ?? epica.id

  return (
    <div className="epica-section">
      <div className="epica-section-header">
        <span className="epica-badge-main">{codigo}</span>
        <span className="epica-section-title">{epica.titulo}</span>
        <div className="epica-meta">
          <span className="epica-hu-count">{hus.length} historia{hus.length !== 1 ? 's' : ''}</span>
          <span className="epica-sp-total">{sp} SP</span>
        </div>
      </div>

      {hus.length > 0 ? (
        <div className="hu-table-wrap">
          <table className="hu-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>ID</th>
                <th style={{ minWidth: 240 }}>Historia de usuario</th>
                <th style={{ minWidth: 200 }}>Criterios de aceptación (resumen)</th>
                <th style={{ width: 80 }}>Prioridad</th>
                <th style={{ width: 44 }}>SP</th>
                <th style={{ width: 64 }}>Sprint</th>
                <th style={{ width: 100 }}>Estado</th>
                <th style={{ width: 100 }}>Responsable</th>
                <th style={{ width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {hus.map(h => {
                const criterios = (h.criterios ?? '')
                  .split('\n')
                  .filter(l => l.trim())
                  .slice(0, 3)

                return (
                  <tr key={h.id}>
                    <td className="td-hu-id">{h.codigo ?? h.id}</td>
                    <td className="td-hu-story">
                      <div className="td-hu-rol">Como {h.rol},</div>
                      <div className="td-hu-deseo">{h.deseo}</div>
                    </td>
                    <td className="td-hu-criterios">
                      <ul>{criterios.map((c, i) => <li key={i}>{c.trim()}</li>)}</ul>
                    </td>
                    <td>{prioBadge(h.prioridad)}</td>
                    <td><span className="badge-sp">{h.sp ?? '—'}</span></td>
                    <td>{h.sprint ? <span className="badge-sprint">S{h.sprint}</span> : '—'}</td>
                    <td>{estadoBadge(h.estado)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.responsable ?? '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-menu-btn"
                          title="Editar"
                          onClick={() => setModalHU({ open: true, editData: h, epicaId: epica.id })}
                        >⋮</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-epica">
          Sin historias.{' '}
          <a href="#" onClick={e => { e.preventDefault(); setModalHU({ open: true, editData: null, epicaId: epica.id }) }}>
            Agregar la primera
          </a>
        </div>
      )}
    </div>
  )
}

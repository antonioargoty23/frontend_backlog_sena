import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { descargarExcel } from '../api/proyectos'
import Header from '../components/Header'
import Subheader from '../components/Subheader'
import Sidebar from '../components/Sidebar'
import ModalEpica from '../components/ModalEpica'
import ModalHU from '../components/ModalHU'
import ModalTarea from '../components/ModalTarea'
import Toast from '../components/Toast'
import '../styles/backlog.css'

// ── Helpers de badge ──────────────────────────────────────────
function PrioBadge({ p }) {
  if (!p) return null
  const l = p.toLowerCase()
  if (l === 'alta')  return <span className="badge badge-alta">Alta</span>
  if (l === 'media') return <span className="badge badge-media">Media</span>
  return <span className="badge badge-baja">Baja</span>
}

function EstadoBadge({ e }) {
  if (!e) return null
  if (e === 'En progreso') return <span className="badge badge-progreso">En progreso</span>
  if (e === 'Hecho')       return <span className="badge badge-hecho">Hecho</span>
  return <span className="badge badge-hacer">Por hacer</span>
}

// ── Panel de estadísticas ─────────────────────────────────────
function StatsPanel({ onClose }) {
  const { epicas, historias, tareas } = useApp()

  const totalSP   = historias.reduce((s, h) => s + (parseInt(h.sp) || 0), 0)
  const spAlta    = historias.filter(h => h.prioridad?.toLowerCase() === 'alta').reduce((s, h)  => s + (parseInt(h.sp) || 0), 0)
  const spMedia   = historias.filter(h => h.prioridad?.toLowerCase() === 'media').reduce((s, h) => s + (parseInt(h.sp) || 0), 0)
  const spBaja    = historias.filter(h => h.prioridad?.toLowerCase() === 'baja').reduce((s, h)  => s + (parseInt(h.sp) || 0), 0)
  const hechas    = historias.filter(h => h.estado === 'Hecho').length
  const enProg    = historias.filter(h => h.estado === 'En progreso').length
  const porHacer  = historias.filter(h => !h.estado || h.estado === 'Por hacer').length
  const pct       = historias.length ? Math.round((hechas / historias.length) * 100) : 0

  return (
    <>
      <div className="stats-backdrop" onClick={onClose} />
      <aside className="stats-panel">
        <div className="stats-panel-header">
          <div className="stats-panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6"  y1="20" x2="6"  y2="14"/>
            </svg>
            Estadísticas
          </div>
          <button className="stats-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="stats-panel-body">
          {/* Tarjetas resumen */}
          <div>
            <div className="sp-section-title">Resumen general</div>
            <div className="sp-cards-grid">
              <div className="sp-card">
                <div className="sp-card-icon epicas">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-val">{epicas.length}</div>
                  <div className="sp-card-lbl">Épicas</div>
                </div>
              </div>
              <div className="sp-card">
                <div className="sp-card-icon historias">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-val">{historias.length}</div>
                  <div className="sp-card-lbl">Historias</div>
                </div>
              </div>
              <div className="sp-card">
                <div className="sp-card-icon tareas">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-val">{tareas.length}</div>
                  <div className="sp-card-lbl">Tareas</div>
                </div>
              </div>
              <div className="sp-card">
                <div className="sp-card-icon sp">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-val">{totalSP}</div>
                  <div className="sp-card-lbl">Story Points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Porcentaje completado */}
          <div>
            <div className="sp-section-title">% Completado</div>
            <div className="sp-pct-wrap">
              <div className="sp-pct-label">
                <span className="sp-pct-text">Historias completadas</span>
                <span className="sp-pct-val">{pct}%</span>
              </div>
              <div className="sp-pct-bar">
                <div className="sp-pct-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          {/* SP por prioridad */}
          <div>
            <div className="sp-section-title">Story Points por prioridad</div>
            {[
              { key: 'alta',  label: 'Alta',  val: spAlta  },
              { key: 'media', label: 'Media', val: spMedia },
              { key: 'baja',  label: 'Baja',  val: spBaja  },
            ].map(({ key, label, val }) => (
              <div key={key} className="sp-prio-row">
                <span className={`sp-prio-label ${key}`}>{label}</span>
                <div className="sp-prio-bar-wrap">
                  <div
                    className={`sp-prio-bar-fill ${key}`}
                    style={{ width: totalSP ? `${Math.round((val / totalSP) * 100)}%` : '0%' }}
                  />
                </div>
                <span className="sp-prio-val">{val} SP</span>
              </div>
            ))}
          </div>

          {/* Estado de historias */}
          <div>
            <div className="sp-section-title">Estado de historias</div>
            <div>
              <div className="sp-estado-row">
                <span className="sp-estado-name">Por hacer</span>
                <span className="sp-estado-count">{porHacer}</span>
              </div>
              <div className="sp-estado-row">
                <span className="sp-estado-name">En progreso</span>
                <span className="sp-estado-count">{enProg}</span>
              </div>
              <div className="sp-estado-row">
                <span className="sp-estado-name">Hecho</span>
                <span className="sp-estado-count">{hechas}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ── Tarea inline ───────────────────────────────────────────────
function TareaItem({ tarea, hu }) {
  const { removeTarea, editTarea, setModalTarea } = useApp()
  const [editingPct, setEditingPct] = useState(false)
  const [pctVal, setPctVal]         = useState(String(tarea.estado ?? 0))

  const handleDeleteTarea = () => {
    if (!window.confirm(`¿Eliminar tarea ${tarea.codigo ?? tarea.id}?`)) return
    removeTarea(hu, tarea.id)
  }

  const handlePctConfirm = () => {
    const num = Math.min(100, Math.max(0, parseInt(pctVal) || 0))
    editTarea(hu, tarea.id, { ...tarea, estado: num })
    setEditingPct(false)
  }

  const handlePctKey = (e) => {
    if (e.key === 'Enter') handlePctConfirm()
    if (e.key === 'Escape') setEditingPct(false)
  }

  const pct = parseInt(tarea.estado) || 0
  const isRNF = tarea.tipo?.includes('RNF')

  return (
    <div className="bl-tarea">
      <span className="bl-tarea-code">{tarea.codigo ?? tarea.id}</span>
      <span className="bl-tarea-name">{tarea.nombre}</span>
      <span className={isRNF ? 'badge-rnf' : 'badge-rf'}>{tarea.tipo ?? 'RF'}</span>
      <span className="bl-tarea-resp">{tarea.responsable || '—'}</span>

      {editingPct ? (
        <div className="bl-pct-edit">
          <input
            className="bl-pct-input"
            type="number"
            min="0"
            max="100"
            value={pctVal}
            onChange={e => setPctVal(e.target.value)}
            onKeyDown={handlePctKey}
            autoFocus
          />
          <button className="bl-pct-ok" onClick={handlePctConfirm}>✓</button>
        </div>
      ) : (
        <div
          className="bl-progress-wrap"
          title="Clic para editar % avance"
          onClick={() => { setPctVal(String(pct)); setEditingPct(true) }}
          style={{ cursor: 'pointer' }}
        >
          <div className="bl-progress-bar">
            <div className="bl-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="bl-progress-pct">{pct}%</span>
        </div>
      )}

      <div className="bl-row-actions">
        <button
          className="bl-btn-icon"
          title="Editar tarea"
          onClick={() => setModalTarea({ open: true, editData: tarea, huActual: hu })}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          className="bl-btn-icon danger"
          title="Eliminar tarea"
          onClick={handleDeleteTarea}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Historia con tareas ────────────────────────────────────────
function HistoriaItem({ historia, epica }) {
  const { tareas, removeHistoria, setModalHU, setModalTarea, setHuSeleccionada } = useApp()
  const [expanded, setExpanded] = useState(false)

  const tareasHU = tareas.filter(t => t.huId === historia.id)

  const handleToggle = () => {
    if (!expanded) setHuSeleccionada(historia.id)
    setExpanded(v => !v)
  }

  const handleAddTarea = (e) => {
    e.stopPropagation()
    setHuSeleccionada(historia.id)
    setModalTarea({ open: true, editData: null, huActual: historia })
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setModalHU({ open: true, editData: historia, epicaId: epica.id })
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminar historia "${historia.nombre}"? Se eliminarán también sus tareas.`)) return
    removeHistoria(epica.id, historia.id)
  }

  return (
    <div className="bl-historia">
      <div className="bl-historia-row">
        <button
          className={`bl-toggle${expanded ? ' open' : ''}`}
          onClick={handleToggle}
          title={expanded ? 'Ocultar tareas' : 'Ver tareas'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <span className="bl-hu-code">{historia.codigo ?? historia.id}</span>
        <span className="bl-hu-name">{historia.nombre}</span>

        <div className="bl-hu-meta">
          <PrioBadge p={historia.prioridad} />
          <span className="bl-sp-chip">{historia.sp ?? '?'} SP</span>
          <EstadoBadge e={historia.estado} />
          {historia.responsable && (
            <span className="bl-resp">{historia.responsable}</span>
          )}
        </div>

        <div className="bl-row-actions">
          <button className="bl-btn-add" onClick={handleAddTarea} title="Nueva tarea">
            + Tarea
          </button>
          <button className="bl-btn-icon" title="Editar historia" onClick={handleEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="bl-btn-icon danger" title="Eliminar historia" onClick={handleDelete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bl-tareas-list">
          {tareasHU.length === 0 ? (
            <span className="bl-tareas-empty">
              Sin tareas.{' '}
              <button style={{ background:'none', border:'none', color:'var(--sena-green)', cursor:'pointer', fontSize:'12px', textDecoration:'underline' }} onClick={handleAddTarea}>
                Agregar la primera
              </button>
            </span>
          ) : (
            tareasHU.map(t => <TareaItem key={t.id} tarea={t} hu={historia} />)
          )}
        </div>
      )}
    </div>
  )
}

// ── Épica colapsable ───────────────────────────────────────────
function EpicaBlock({ epica }) {
  const { historias, removeEpica, setModalHU } = useApp()
  const [collapsed, setCollapsed] = useState(false)

  const hus = historias.filter(h => h.epicaId === epica.id)
  const sp  = hus.reduce((s, h) => s + (parseInt(h.sp) || 0), 0)

  const handleAddHistoria = (e) => {
    e.stopPropagation()
    setModalHU({ open: true, editData: null, epicaId: epica.id })
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminar épica "${epica.titulo}"? Se eliminarán también sus historias.`)) return
    removeEpica(epica.id)
  }

  return (
    <div className="bl-epica">
      <div className="bl-epica-header" onClick={() => setCollapsed(v => !v)}>
        <button
          className={`bl-toggle${!collapsed ? ' open' : ''}`}
          onClick={(e) => { e.stopPropagation(); setCollapsed(v => !v) }}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <span className="epica-badge-main">{epica.codigo ?? epica.id}</span>
        <span className="bl-epica-title">{epica.titulo}</span>

        <div className="bl-epica-meta">
          <span className="epica-hu-count">{hus.length} historia{hus.length !== 1 ? 's' : ''}</span>
          <span className="epica-sp-total">{sp} SP</span>
        </div>

        <div className="bl-row-actions">
          <button className="bl-btn-add" onClick={handleAddHistoria} title="Nueva historia">
            + Historia
          </button>
          <button className="bl-btn-icon danger" title="Eliminar épica" onClick={handleDelete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="bl-epica-body">
          {hus.length === 0 ? (
            <div className="bl-epica-empty">
              Sin historias.{' '}
              <button onClick={handleAddHistoria}>Agregar la primera</button>
            </div>
          ) : (
            hus.map(h => <HistoriaItem key={h.id} historia={h} epica={epica} />)
          )}
        </div>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────
export default function BacklogPage() {
  const {
    proyecto, epicas, historias, tareas, stats, loading,
    vistaActual, huSeleccionada, setHuSeleccionada,
    setModalEpica, setModalTarea, removeTarea,
  } = useApp()

  const [statsOpen, setStatsOpen] = useState(false)

  if (loading) {
    return (
      <>
        <Header />
        <Subheader />
        <div className="app-body">
          <Sidebar />
          <div className="bl-loading">Cargando proyecto…</div>
        </div>
      </>
    )
  }

  const handleExcel = () => {
    if (proyecto.id) descargarExcel(proyecto.id).catch(console.error)
  }

  const huActual  = historias.find(h => h.id === huSeleccionada)
  const tareasHU  = tareas.filter(t => t.huId === huSeleccionada)

  return (
    <>
      <Header />
      <Subheader />

      <div className="app-body">
        <Sidebar />

        {/* ── Vista: Backlog (árbol anidado) ── */}
        <div className={`view${vistaActual === 'backlog' ? ' active' : ''}`}>
          <div className="app-main">
            <div className="bl-content">

              {/* Encabezado del backlog */}
              <div className="bl-top-bar">
                <div className="bl-top-info">
                  <div className="bl-top-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="bl-top-title">{proyecto.nombre || 'Backlog del producto'}</div>
                    <div className="bl-top-sub">
                      {epicas.length} épica{epicas.length !== 1 ? 's' : ''} · {historias.length} historia{historias.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className="bl-top-sp">{stats.sp} SP total</span>
                </div>
                <div className="bl-top-actions">
                  <button className="btn-header btn-xlsx" onClick={handleExcel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Descargar Excel
                  </button>
                  <button className="btn-header btn-historia" onClick={() => setStatsOpen(v => !v)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6"  y1="20" x2="6"  y2="14"/>
                    </svg>
                    Estadísticas
                  </button>
                </div>
              </div>

              {/* Árbol anidado */}
              <div className="bl-tree">
                {epicas.length === 0 ? (
                  <div className="bl-tree-empty">
                    <p>No hay épicas todavía.</p>
                    <p style={{ marginTop: 6 }}>Usa el botón <strong>+ Épica</strong> del menú superior para crear la primera.</p>
                  </div>
                ) : (
                  epicas.map(ep => <EpicaBlock key={ep.id} epica={ep} />)
                )}
                <button className="bl-add-epica" onClick={() => setModalEpica({ open: true })}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Nueva Épica
                </button>
              </div>
            </div>
          </div>

          {statsOpen && <StatsPanel onClose={() => setStatsOpen(false)} />}
        </div>

        {/* ── Vista: Tareas ── */}
        <div className={`view${vistaActual === 'tareas' ? ' active' : ''}`}>
          <div className="tareas-layout">

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
                      <p>Como {huActual.rol} · {tareasHU.length} tarea(s)</p>
                    </div>
                    <button
                      className="btn-header btn-epica"
                      onClick={() => setModalTarea({ open: true, editData: null, huActual })}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
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
                    tareasHU.map(t => (
                      <div key={t.id} className="tarea-card">
                        <div className="tarea-card-head">
                          <span className="tarea-id-badge">{t.codigo ?? t.id}</span>
                          <span className="tarea-nombre">{t.nombre}</span>
                          <span className={t.tipo?.includes('RNF') ? 'badge-rnf' : 'badge-rf'}>{t.tipo}</span>
                          <button
                            className="row-menu-btn"
                            title="Eliminar"
                            style={{ color: 'var(--priority-alta-text)' }}
                            onClick={() => {
                              if (!window.confirm(`¿Eliminar tarea ${t.codigo ?? t.id}?`)) return
                              removeTarea(huActual, t.id)
                            }}
                          >✕</button>
                        </div>
                        <div className="tarea-card-body">
                          <div className="tarea-field">
                            <div className="tf-label">Responsable</div>
                            <div className="tf-val">{t.responsable || '—'}</div>
                          </div>
                          <div className="tarea-field">
                            <div className="tf-label">Estimación</div>
                            <div className="tf-val">{t.estimacion ? `${t.estimacion} día(s)` : '—'}</div>
                          </div>
                          <div className="tarea-field">
                            <div className="tf-label">Prioridad</div>
                            <div className="tf-val">{t.prioridad}</div>
                          </div>
                          <div className="tarea-field-full">
                            <div className="tf-label">Avance · {t.estado || 0}%</div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${t.estado || 0}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
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

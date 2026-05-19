import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { descargarExcel } from '../api/proyectos'
import Header from '../components/Header'
import Subheader from '../components/Subheader'
import Sidebar from '../components/Sidebar'
import FormEpica from '../components/FormEpica'
import FormHistoria from '../components/FormHistoria'
import FormPoker from '../components/FormPoker'
import FormTarea from '../components/FormTarea'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import '../styles/backlog.css'

// ── SVGs reutilizables ─────────────────────────────────────────
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
)
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
// Ícono de cartas para Planning Poker
const IconPoker = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2h11a2 2 0 012 2v1h1a2 2 0 012 2v13a2 2 0 01-2 2H8a2 2 0 01-2-2v-1H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v13h2V7a2 2 0 012-2h7V4H4zm4 3v13h11V7H8z"/>
  </svg>
)

// ── Badges ─────────────────────────────────────────────────────
function PrioBadge({ p }) {
  if (!p) return <span className="td-muted">—</span>
  const l = p.toLowerCase()
  if (l === 'alta')  return <span className="badge badge-alta">Alta</span>
  if (l === 'media') return <span className="badge badge-media">Media</span>
  return <span className="badge badge-baja">Baja</span>
}

function EstadoBadge({ e }) {
  if (!e || e === 'Por hacer') return <span className="badge badge-hacer">Por hacer</span>
  if (e === 'En progreso')     return <span className="badge badge-progreso">En progreso</span>
  if (e === 'Hecho')           return <span className="badge badge-hecho">Hecho</span>
  return <span className="td-muted">—</span>
}

// ── Tarjetas de estadísticas (top del backlog) ─────────────────
function StatsCards() {
  const { epicas, historias } = useApp()
  const sp = historias.reduce((s, h) => s + (parseInt(h.sp ?? h.story_points ?? h.storyPoints) || 0), 0)
  const sprints = new Set(historias.map(h => h.sprint).filter(Boolean)).size

  const cards = [
    { cls: 'epicas',    val: epicas.length,    lbl: 'Épicas',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> },
    { cls: 'historias', val: historias.length,  lbl: 'Historias',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
    { cls: 'sp',        val: sp,                lbl: 'Story Points',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    { cls: 'sprints',   val: sprints,           lbl: 'Sprints',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  ]

  return (
    <div className="stats-grid">
      {cards.map(c => (
        <div key={c.lbl} className="stat-card">
          <div className={`stat-icon ${c.cls}`}>{c.icon}</div>
          <div className="stat-info">
            <div className="stat-val">{c.val}</div>
            <div className="stat-lbl">{c.lbl}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Panel de estadísticas (drawer lateral) ─────────────────────
function StatsPanel({ onClose }) {
  const { epicas, historias, tareas } = useApp()

  const totalSP  = historias.reduce((s, h) => s + (parseInt(h.sp ?? h.story_points ?? h.storyPoints) || 0), 0)
  const spAlta   = historias.filter(h => h.prioridad?.toLowerCase() === 'alta').reduce((s, h) => s + (parseInt(h.sp ?? h.story_points ?? h.storyPoints) || 0), 0)
  const spMedia  = historias.filter(h => h.prioridad?.toLowerCase() === 'media').reduce((s, h) => s + (parseInt(h.sp ?? h.story_points ?? h.storyPoints) || 0), 0)
  const spBaja   = historias.filter(h => h.prioridad?.toLowerCase() === 'baja').reduce((s, h) => s + (parseInt(h.sp ?? h.story_points ?? h.storyPoints) || 0), 0)
  const hechas   = historias.filter(h => h.estado === 'Hecho').length
  const enProg   = historias.filter(h => h.estado === 'En progreso').length
  const porHacer = historias.filter(h => !h.estado || h.estado === 'Por hacer').length
  const pct      = historias.length ? Math.round((hechas / historias.length) * 100) : 0

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
          <div>
            <div className="sp-section-title">Resumen general</div>
            <div className="sp-cards-grid">
              {[
                { cls: 'epicas',    val: epicas.length,    lbl: 'Épicas' },
                { cls: 'historias', val: historias.length,  lbl: 'Historias' },
                { cls: 'tareas',    val: tareas.length,     lbl: 'Tareas' },
                { cls: 'sp',        val: totalSP,           lbl: 'Story Points' },
              ].map(c => (
                <div key={c.lbl} className="sp-card">
                  <div className={`sp-card-icon ${c.cls}`} />
                  <div>
                    <div className="sp-card-val">{c.val}</div>
                    <div className="sp-card-lbl">{c.lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                  <div className={`sp-prio-bar-fill ${key}`} style={{ width: totalSP ? `${Math.round((val / totalSP) * 100)}%` : '0%' }} />
                </div>
                <span className="sp-prio-val">{val} SP</span>
              </div>
            ))}
          </div>

          <div>
            <div className="sp-section-title">Estado de historias</div>
            {[
              { name: 'Por hacer',    count: porHacer },
              { name: 'En progreso',  count: enProg   },
              { name: 'Hecho',        count: hechas   },
            ].map(({ name, count }) => (
              <div key={name} className="sp-estado-row">
                <span className="sp-estado-name">{name}</span>
                <span className="sp-estado-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}

// ── Fila de Historia (dentro de la tabla) ──────────────────────
function HistoriaRow({ historia, epica }) {
  const { removeHistoria, setModalHU, setModalPoker, askConfirm } = useApp()

  const handleEdit = (e) => {
    e.stopPropagation()
    setModalHU({ open: true, editData: historia, epicaId: epica.id })
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    const ok = await askConfirm({
      title:   `¿Eliminar "${historia.codigo}"?`,
      message: 'Se eliminarán también todas sus tareas.',
    })
    if (!ok) return
    removeHistoria(epica.id, historia.id)
  }

  const criterioLines = (historia.criterios ?? '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 3)

  const sp = historia.sp ?? historia.story_points ?? historia.storyPoints

  return (
    <tr className="hu-row">
      <td className="td-hu-id">{historia.codigo}</td>

      <td className="td-hu-story">
        {historia.rol ? (
          <>
            <div className="td-hu-rol">Como {historia.rol},</div>
            <div className="td-hu-deseo">{historia.deseo}</div>
            {historia.para && <div className="td-hu-para">para {historia.para}</div>}
          </>
        ) : (
          <div className="td-hu-deseo">{historia.nombre}</div>
        )}
      </td>

      <td className="td-hu-criterios">
        {criterioLines.length > 0
          ? <ul>{criterioLines.map((l, i) => <li key={i}>{l}</li>)}</ul>
          : <span className="td-muted">—</span>
        }
      </td>

      <td><PrioBadge p={historia.prioridad} /></td>

      <td className="td-center">
        {sp ? <span className="badge-sp">{sp}</span> : <span className="td-muted">—</span>}
      </td>

      <td className="td-center">
        {historia.sprint
          ? <span className="badge-sprint">S{historia.sprint}</span>
          : <span className="td-muted">—</span>
        }
      </td>

      <td><EstadoBadge e={historia.estado} /></td>

      <td className="td-responsable">
        {historia.responsable || <span className="td-muted">—</span>}
      </td>

      <td>
        <div className="row-actions">
          <button
            className="bl-btn-icon poker"
            title="Planning Poker"
            onClick={(e) => { e.stopPropagation(); setModalPoker({ open: true, historia }) }}
          >
            <IconPoker />
          </button>
          <button className="bl-btn-icon" title="Editar historia" onClick={handleEdit}>
            <IconEdit />
          </button>
          <button className="bl-btn-icon danger" title="Eliminar historia" onClick={handleDelete}>
            <IconTrash />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Sección de Épica (cabecera + tabla de HUs) ─────────────────
function EpicaSection({ epica }) {
  const { historias, removeEpica, setModalHU, setModalEpica, askConfirm } = useApp()
  const [collapsed, setCollapsed] = useState(false)

  const hus = historias.filter(h => h.epicaId === epica.id)
  const sp  = hus.reduce((s, h) => s + (parseInt(h.sp ?? h.story_points ?? h.storyPoints) || 0), 0)

  const handleAddHistoria = (e) => {
    e.stopPropagation()
    setModalHU({ open: true, editData: null, epicaId: epica.id })
  }
  const handleEditEpica = (e) => {
    e.stopPropagation()
    setModalEpica({ open: true, editData: epica })
  }
  const handleDeleteEpica = async (e) => {
    e.stopPropagation()
    const ok = await askConfirm({
      title:   `¿Eliminar épica "${epica.codigo}"?`,
      message: 'Se eliminarán también todas sus historias y tareas.',
    })
    if (!ok) return
    removeEpica(epica.id)
  }

  // Muestra el texto de la épica: formato ágil si hay rol, si no, titulo
  const epicaTexto = epica.rol
    ? `Como ${epica.rol}, deseo ${epica.deseo ?? '…'}`
    : (epica.titulo ?? epica.codigo)

  return (
    <div className="epica-section">
      <div className="epica-section-header" onClick={() => setCollapsed(v => !v)}>
        <button
          className={`bl-toggle${!collapsed ? ' open' : ''}`}
          onClick={e => { e.stopPropagation(); setCollapsed(v => !v) }}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <IconChevron />
        </button>

        <span className="epica-badge-main">{epica.codigo}</span>
        <span className="epica-section-title">{epicaTexto}</span>

        <div className="epica-meta">
          <span className="epica-hu-count">{hus.length} historia{hus.length !== 1 ? 's' : ''}</span>
          <span className="epica-sp-total">{sp} SP</span>
        </div>

        <div className="bl-row-actions">
          <button className="bl-btn-add" onClick={handleAddHistoria} title="Nueva historia">
            + Historia
          </button>
          <button className="bl-btn-icon" title="Editar épica" onClick={handleEditEpica}>
            <IconEdit />
          </button>
          <button className="bl-btn-icon danger" title="Eliminar épica" onClick={handleDeleteEpica}>
            <IconTrash />
          </button>
        </div>
      </div>

      {!collapsed && (
        hus.length === 0 ? (
          <div className="empty-epica">
            Sin historias aún.{' '}
            <button onClick={handleAddHistoria}>Agregar la primera</button>
          </div>
        ) : (
          <div className="hu-table-wrap">
            <table className="hu-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th style={{ minWidth: 240 }}>Historia de usuario</th>
                  <th style={{ minWidth: 180 }}>Criterios de aceptación</th>
                  <th style={{ width: 90 }}>Prioridad</th>
                  <th style={{ width: 50, textAlign: 'center' }}>SP</th>
                  <th style={{ width: 68, textAlign: 'center' }}>Sprint</th>
                  <th style={{ width: 110 }}>Estado</th>
                  <th style={{ width: 108 }}>Responsable</th>
                  <th style={{ width: 72, textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {hus.map(h => (
                  <HistoriaRow key={h.id} historia={h} epica={epica} />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ── Tarea inline (solo en la pestaña Tareas) ───────────────────
function TareaItemTab({ tarea, hu }) {
  const { removeTarea, setModalTarea, askConfirm } = useApp()

  const handleDelete = async () => {
    const ok = await askConfirm({ title: `¿Eliminar tarea ${tarea.codigo ?? tarea.id}?` })
    if (!ok) return
    removeTarea(hu, tarea.id)
  }

  return (
    <div className="tarea-card">
      <div className="tarea-card-head">
        <span className="tarea-id-badge">{tarea.codigo ?? tarea.id}</span>
        <span className="tarea-nombre">{tarea.nombre}</span>
        <span className={tarea.tipo?.includes('RNF') ? 'badge-rnf' : 'badge-rf'}>{tarea.tipo ?? 'RF'}</span>
        <button
          className="bl-btn-icon"
          title="Editar tarea"
          onClick={() => setModalTarea({ open: true, editData: tarea, huActual: hu })}
        >
          <IconEdit />
        </button>
        <button
          className="bl-btn-icon danger"
          title="Eliminar tarea"
          onClick={handleDelete}
          style={{ color: 'var(--priority-alta-text)' }}
        >
          <IconTrash />
        </button>
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
          <div className="tf-val">{tarea.prioridad || '—'}</div>
        </div>
        <div className="tarea-field-full">
          <div className="tf-label">Avance · {tarea.estado || 0}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${tarea.estado || 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────
export default function BacklogPage() {
  const {
    proyecto, epicas, historias, tareas,
    loading, vistaActual, huSeleccionada, setHuSeleccionada,
    setModalEpica, setModalTarea, askConfirm, removeTarea,
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

  const huActual = historias.find(h => h.id === huSeleccionada)
  const tareasHU = tareas.filter(t => t.huId === huSeleccionada)

  return (
    <>
      <Header />
      <Subheader />

      <div className="app-body">
        <Sidebar />

        {/* ══ VISTA: PRODUCT BACKLOG ══ */}
        <div className={`view${vistaActual === 'backlog' ? ' active' : ''}`}>
          <div className="app-main">
            <div className="bl-content">

              {/* Barra superior */}
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
                    <div className="bl-top-sub">Vista construida automáticamente al editar</div>
                  </div>
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

              {/* Tarjetas de estadísticas */}
              <StatsCards />

              {/* Épicas con tablas */}
              {epicas.length === 0 ? (
                <div className="bl-tree-empty">
                  <p>No hay épicas todavía.</p>
                  <p style={{ marginTop: 6 }}>
                    Usa el botón <strong>+ Épica</strong> del menú superior para crear la primera.
                  </p>
                </div>
              ) : (
                <div className="epica-list">
                  {epicas.map(ep => <EpicaSection key={ep.id} epica={ep} />)}
                </div>
              )}

              <button className="bl-add-epica" onClick={() => setModalEpica({ open: true })}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nueva Épica
              </button>

            </div>
          </div>

          {statsOpen && <StatsPanel onClose={() => setStatsOpen(false)} />}
        </div>

        {/* ══ VISTA: TAREAS ══ */}
        <div className={`view${vistaActual === 'tareas' ? ' active' : ''}`}>
          <div className="tareas-layout">

            <div className="tareas-sidebar">
              <div className="sidebar-title" style={{ marginBottom: 10 }}>Historias de usuario</div>
              {historias.map(h => {
                const ep = epicas.find(e => e.id === h.epicaId)
                const epLabel = ep
                  ? `${ep.codigo} · ${(ep.rol ? `Como ${ep.rol}` : ep.titulo ?? '').substring(0, 28)}…`
                  : ''
                return (
                  <div
                    key={h.id}
                    className={`hu-selector-item${huSeleccionada === h.id ? ' selected' : ''}`}
                    onClick={() => setHuSeleccionada(h.id)}
                  >
                    <div className="hu-sel-id">{h.codigo ?? h.id}</div>
                    <div className="hu-sel-name">
                      {h.rol ? `Como ${h.rol}` : h.nombre}
                    </div>
                    <div className="hu-sel-epica">{epLabel}</div>
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
                        {' · '}
                        {huActual.rol ? `Como ${huActual.rol}` : huActual.nombre}
                      </h2>
                      <p>{huActual.deseo ? huActual.deseo : ''} · {tareasHU.length} tarea(s)</p>
                    </div>
                    <button
                      className="btn-header btn-epica"
                      onClick={() => setModalTarea({ open: true, editData: null, huActual })}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
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
                      <TareaItemTab key={t.id} tarea={t} hu={huActual} />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      <FormEpica />
      <FormHistoria />
      <FormPoker />
      <FormTarea />
      <ConfirmDialog />
      <Toast />
    </>
  )
}

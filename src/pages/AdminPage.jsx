import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUsuarios, deleteUsuario, toggleActivoUsuario } from '../api/usuarios'
import { getProyectos, deleteProyecto } from '../api/proyectos'
import '../styles/admin.css'

// ── Diálogo de confirmación ──────────────────────────────────────────────────

function ConfirmDialog({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="admin-confirm-overlay" onClick={onCancelar}>
      <div className="admin-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="admin-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <div className="admin-confirm-title">¿Confirmar eliminación?</div>
        <div className="admin-confirm-msg">{mensaje}</div>
        <div className="admin-confirm-btns">
          <button className="btn-confirm-cancel-sm" onClick={onCancelar}>Cancelar</button>
          <button className="btn-confirm-delete-sm" onClick={onConfirmar}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

// ── Pestaña Usuarios ─────────────────────────────────────────────────────────

function TabUsuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [confirm, setConfirm]     = useState(null)   // { id, nombre }
  const [procesando, setProcesando] = useState(null) // id en operación

  const cargar = useCallback(() => {
    setCargando(true)
    getUsuarios()
      .then(res => setUsuarios(res.data?.data ?? []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleToggle = async (u) => {
    setProcesando(u.id)
    try {
      const res = await toggleActivoUsuario(u.id)
      const nuevoActivo = res.data?.activo ?? !u.activo
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: nuevoActivo } : x))
    } catch (err) {
      console.error(err)
    } finally {
      setProcesando(null)
    }
  }

  const handleEliminar = async () => {
    if (!confirm) return
    setProcesando(confirm.id)
    setConfirm(null)
    try {
      await deleteUsuario(confirm.id)
      setUsuarios(prev => prev.filter(u => u.id !== confirm.id))
    } catch (err) {
      console.error(err)
    } finally {
      setProcesando(null)
    }
  }

  if (cargando) return <div className="admin-empty">Cargando usuarios…</div>

  return (
    <>
      <div className="admin-toolbar">
        <span className="admin-count">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</span>
      </div>

      {usuarios.length === 0 ? (
        <div className="admin-empty">No hay usuarios registrados.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Ficha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.rol}`}>{u.rol}</span>
                  </td>
                  <td>{u.ficha?.codigo ?? u.fichaId ?? '—'}</td>
                  <td>
                    <span className={`badge ${u.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className={`btn-admin-toggle ${u.activo ? 'desactivar' : 'activar'}`}
                        disabled={procesando === u.id}
                        onClick={() => handleToggle(u)}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        className="btn-admin-delete"
                        disabled={procesando === u.id}
                        onClick={() => setConfirm({ id: u.id, nombre: `${u.nombre} ${u.apellido}` })}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          mensaje={`¿Eliminar al usuario "${confirm.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={handleEliminar}
          onCancelar={() => setConfirm(null)}
        />
      )}
    </>
  )
}

// ── Pestaña Proyectos ────────────────────────────────────────────────────────

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function TabProyectos() {
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [confirm, setConfirm]     = useState(null)   // { id, nombre }
  const [procesando, setProcesando] = useState(null)

  const cargar = useCallback(() => {
    setCargando(true)
    getProyectos()
      .then(res => setProyectos(res.data?.data ?? []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleEliminar = async () => {
    if (!confirm) return
    setProcesando(confirm.id)
    setConfirm(null)
    try {
      await deleteProyecto(confirm.id)
      setProyectos(prev => prev.filter(p => p.id !== confirm.id))
    } catch (err) {
      console.error(err)
    } finally {
      setProcesando(null)
    }
  }

  if (cargando) return <div className="admin-empty">Cargando proyectos…</div>

  return (
    <>
      <div className="admin-toolbar">
        <span className="admin-count">{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}</span>
      </div>

      {proyectos.length === 0 ? (
        <div className="admin-empty">No hay proyectos registrados.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ficha</th>
                <th>Dueño / Product Owner</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.ficha?.codigo ?? p.fichaId ?? '—'}</td>
                  <td>{p.dueno || '—'}</td>
                  <td>{formatFecha(p.created_at ?? p.createdAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="btn-admin-delete"
                        disabled={procesando === p.id}
                        onClick={() => setConfirm({ id: p.id, nombre: p.nombre })}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          mensaje={`¿Eliminar el proyecto "${confirm.nombre}"? Se eliminarán todas sus épicas, historias y tareas.`}
          onConfirmar={handleEliminar}
          onCancelar={() => setConfirm(null)}
        />
      )}
    </>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()
  const [tab, setTab] = useState('usuarios')

  const esInstructor = usuario?.rol?.nombre === 'instructor'

  useEffect(() => {
    if (!esInstructor) navigate('/dashboard', { replace: true })
  }, [esInstructor, navigate])

  if (!esInstructor) return null

  return (
    <div className="admin-page">
      <header className="admin-header">
        <span className="admin-header-title">⚙ Administración</span>
        <button className="admin-back-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver al Dashboard
        </button>
      </header>

      <div className="admin-body">
        <div className="admin-tabs">
          <button
            className={`admin-tab${tab === 'usuarios' ? ' active' : ''}`}
            onClick={() => setTab('usuarios')}
          >
            Usuarios
          </button>
          <button
            className={`admin-tab${tab === 'proyectos' ? ' active' : ''}`}
            onClick={() => setTab('proyectos')}
          >
            Proyectos
          </button>
        </div>

        {tab === 'usuarios'  && <TabUsuarios />}
        {tab === 'proyectos' && <TabProyectos />}
      </div>
    </div>
  )
}

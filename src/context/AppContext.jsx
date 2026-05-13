import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProyectos, updateProyecto, getBacklog } from '../api/proyectos'
import {
  createEpica, updateEpica, deleteEpica,
  createHistoria, updateHistoria, deleteHistoria,
  createTarea, deleteTarea,
  cacheManyHistoriasEpicas, cacheHistoriaEpica,
} from '../api/backlog'
import api from '../api/axios'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [proyecto, setProyecto] = useState({ id: null, nombre: '', dueno: '' })
  const [epicas, setEpicas]     = useState([])
  const [historias, setHistorias] = useState([])
  const [tareas, setTareas]     = useState([])
  const [loading, setLoading]   = useState(true)

  // UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [vistaActual, setVistaActual]           = useState('backlog')
  const [huSeleccionada, setHuSeleccionada]     = useState(null)

  // Modales
  const [modalEpica, setModalEpica] = useState({ open: false })
  const [modalHU, setModalHU]       = useState({ open: false, editData: null, epicaId: null })
  const [modalTarea, setModalTarea] = useState({ open: false })

  // Toast
  const [toastMsg, setToastMsg] = useState(null)

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2800)
  }, [])

  // ── Carga inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    getProyectos()
      .then(res => {
        const p = Array.isArray(res.data) ? res.data[0] : res.data
        if (!p) return Promise.resolve(null)
        setProyecto({ id: p.id, nombre: p.nombre, dueno: p.dueno ?? '' })
        localStorage.setItem('proyectoActivo', p.id)
        return getBacklog(p.id)
      })
      .then(res => {
        if (!res) return
        const { epicas: ep = [], historias: hu = [] } = res.data
        setEpicas(ep)
        setHistorias(hu)
        cacheManyHistoriasEpicas(hu)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── Tareas: carga al seleccionar HU ──────────────────────────────────────────
  useEffect(() => {
    if (!huSeleccionada) return
    const hu = historias.find(h => h.id === huSeleccionada)
    if (!hu) return
    const pId = proyecto.id
    api.get(`/proyectos/${pId}/epicas/${hu.epicaId}/historias/${hu.id}/tareas`)
      .then(res => {
        setTareas(prev => [
          ...prev.filter(t => t.huId !== huSeleccionada),
          ...res.data.map(t => ({ ...t, huId: hu.id })),
        ])
      })
      .catch(console.error)
  }, [huSeleccionada])

  // ── Stats derivados ───────────────────────────────────────────────────────────
  const stats = {
    epicas:    epicas.length,
    historias: historias.length,
    sp:        historias.reduce((s, h) => s + (parseInt(h.sp) || 0), 0),
    sprints:   new Set(historias.map(h => h.sprint).filter(Boolean)).size,
  }

  // ── Épicas ────────────────────────────────────────────────────────────────────
  async function addEpica(data) {
    const res = await createEpica(proyecto.id, data)
    setEpicas(prev => [...prev, res.data])
    showToast(`✔ Épica ${res.data.codigo ?? res.data.id} creada`)
  }

  async function removeEpica(epicaId) {
    await deleteEpica(proyecto.id, epicaId)
    setEpicas(prev => prev.filter(e => e.id !== epicaId))
    setHistorias(prev => prev.filter(h => h.epicaId !== epicaId))
    showToast('Épica eliminada')
  }

  // ── Historias ──────────────────────────────────────────────────────────────────
  async function addHistoria(epicaId, data) {
    const res = await createHistoria(epicaId, data)
    const nueva = { ...res.data, epicaId }
    setHistorias(prev => [...prev, nueva])
    cacheHistoriaEpica(nueva.id, epicaId)
    showToast(`✔ Historia ${res.data.codigo ?? res.data.id} creada`)
  }

  async function editHistoria(epicaId, historiaId, data) {
    const res = await updateHistoria(epicaId, historiaId, data)
    setHistorias(prev => prev.map(h => h.id === historiaId ? { ...res.data, epicaId } : h))
    showToast('✔ Historia actualizada')
  }

  async function removeHistoria(epicaId, historiaId) {
    await deleteHistoria(epicaId, historiaId)
    setHistorias(prev => prev.filter(h => h.id !== historiaId))
    setTareas(prev => prev.filter(t => t.huId !== historiaId))
    showToast('Historia eliminada')
  }

  // ── Tareas ────────────────────────────────────────────────────────────────────
  async function addTarea(hu, data) {
    const res = await createTarea(hu.id, data)
    setTareas(prev => [...prev, { ...res.data, huId: hu.id }])
    showToast(`✔ Tarea ${res.data.codigo ?? res.data.id} agregada`)
  }

  async function removeTarea(hu, tareaId) {
    await deleteTarea(hu.id, tareaId)
    setTareas(prev => prev.filter(t => t.id !== tareaId))
    showToast('Tarea eliminada')
  }

  // ── Proyecto inline ────────────────────────────────────────────────────────────
  async function syncProyecto(nombre, dueno) {
    setProyecto(p => ({ ...p, nombre, dueno }))
    await updateProyecto(proyecto.id, { nombre, dueno }).catch(console.error)
  }

  return (
    <AppContext.Provider value={{
      proyecto, epicas, historias, tareas, stats, loading,
      sidebarCollapsed, setSidebarCollapsed,
      vistaActual, setVistaActual,
      huSeleccionada, setHuSeleccionada,
      modalEpica, setModalEpica,
      modalHU, setModalHU,
      modalTarea, setModalTarea,
      toastMsg,
      addEpica, removeEpica,
      addHistoria, editHistoria, removeHistoria,
      addTarea, removeTarea,
      syncProyecto,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

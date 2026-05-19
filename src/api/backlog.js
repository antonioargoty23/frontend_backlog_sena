import api from './axios'

// ── Helpers de contexto ──────────────────────────────────────────────────────
// El AppContext llama a estas funciones al cargar los datos para que las
// operaciones anidadas puedan resolver los IDs de ruta necesarios.

const proyectoId = () => localStorage.getItem('proyectoActivo')

// Caché en memoria: historiaId → epicaId (se puebla desde el contexto)
const historiaEpicaMap = new Map()

export const cacheHistoriaEpica = (historiaId, epicaId) => {
  historiaEpicaMap.set(String(historiaId), String(epicaId))
}

export const cacheManyHistoriasEpicas = (historias) => {
  historias.forEach(h => historiaEpicaMap.set(String(h.id), String(h.epicaId)))
}

// ── Épicas ───────────────────────────────────────────────────────────────────

export const createEpica = (proyectoId, data) =>
  api.post(`/proyectos/${proyectoId}/epicas`, data)

export const updateEpica = (proyectoId, epicaId, data) =>
  api.put(`/proyectos/${proyectoId}/epicas/${epicaId}`, data)

export const deleteEpica = (proyectoId, epicaId) =>
  api.delete(`/proyectos/${proyectoId}/epicas/${epicaId}`)

// ── Historias ────────────────────────────────────────────────────────────────

export const createHistoria = (epicaId, data) =>
  api.post(`/proyectos/${proyectoId()}/epicas/${epicaId}/historias`, data)

export const updateHistoria = (epicaId, historiaId, data) =>
  api.put(`/proyectos/${proyectoId()}/epicas/${epicaId}/historias/${historiaId}`, data)

export const deleteHistoria = (epicaId, historiaId) =>
  api.delete(`/proyectos/${proyectoId()}/epicas/${epicaId}/historias/${historiaId}`)

export const planHistoria = (epicaId, historiaId, data) =>
  api.patch(`/proyectos/${proyectoId()}/epicas/${epicaId}/historias/${historiaId}/plan`, data)

// ── Tareas ───────────────────────────────────────────────────────────────────
// La ruta requiere epicaId. Se resuelve desde el caché historiaEpicaMap.

const resolveEpicaId = (historiaId) => {
  const eId = historiaEpicaMap.get(String(historiaId))
  if (!eId) throw new Error(`epicaId no encontrado para historia ${historiaId}. Llama a cacheHistoriaEpica primero.`)
  return eId
}

export const createTarea = (historiaId, data) => {
  const epicaId = resolveEpicaId(historiaId)
  return api.post(
    `/proyectos/${proyectoId()}/epicas/${epicaId}/historias/${historiaId}/tareas`,
    data
  )
}

export const updateTarea = (historiaId, tareaId, data) => {
  const epicaId = resolveEpicaId(historiaId)
  return api.put(
    `/proyectos/${proyectoId()}/epicas/${epicaId}/historias/${historiaId}/tareas/${tareaId}`,
    data
  )
}

export const deleteTarea = (historiaId, tareaId) => {
  const epicaId = resolveEpicaId(historiaId)
  return api.delete(
    `/proyectos/${proyectoId()}/epicas/${epicaId}/historias/${historiaId}/tareas/${tareaId}`
  )
}

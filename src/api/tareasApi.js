import client from './client'

const base = (proyectoId, epicaId, historiaId) =>
  `/proyectos/${proyectoId}/epicas/${epicaId}/historias/${historiaId}/tareas`

export const getTareas = (proyectoId, epicaId, historiaId) =>
  client.get(base(proyectoId, epicaId, historiaId))

export const createTarea = (proyectoId, epicaId, historiaId, data) =>
  client.post(base(proyectoId, epicaId, historiaId), data)

export const updateTarea = (proyectoId, epicaId, historiaId, tareaId, data) =>
  client.put(`${base(proyectoId, epicaId, historiaId)}/${tareaId}`, data)

export const deleteTarea = (proyectoId, epicaId, historiaId, tareaId) =>
  client.delete(`${base(proyectoId, epicaId, historiaId)}/${tareaId}`)

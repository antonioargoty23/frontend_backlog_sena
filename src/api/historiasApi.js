import client from './client'

const base = (proyectoId, epicaId) =>
  `/proyectos/${proyectoId}/epicas/${epicaId}/historias`

export const getHistorias = (proyectoId, epicaId) =>
  client.get(base(proyectoId, epicaId))

export const createHistoria = (proyectoId, epicaId, data) =>
  client.post(base(proyectoId, epicaId), data)

export const updateHistoria = (proyectoId, epicaId, historiaId, data) =>
  client.put(`${base(proyectoId, epicaId)}/${historiaId}`, data)

export const deleteHistoria = (proyectoId, epicaId, historiaId) =>
  client.delete(`${base(proyectoId, epicaId)}/${historiaId}`)

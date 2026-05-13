import client from './client'

const base = (proyectoId) => `/proyectos/${proyectoId}/epicas`

export const getEpicas = (proyectoId) =>
  client.get(base(proyectoId))

export const createEpica = (proyectoId, data) =>
  client.post(base(proyectoId), data)

export const updateEpica = (proyectoId, epicaId, data) =>
  client.put(`${base(proyectoId)}/${epicaId}`, data)

export const deleteEpica = (proyectoId, epicaId) =>
  client.delete(`${base(proyectoId)}/${epicaId}`)

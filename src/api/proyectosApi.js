import client from './client'

export const getProyectos = () =>
  client.get('/proyectos')

export const getProyecto = (id) =>
  client.get(`/proyectos/${id}`)

export const createProyecto = (data) =>
  client.post('/proyectos', data)

export const updateProyecto = (id, data) =>
  client.put(`/proyectos/${id}`, data)

export const getBacklog = (proyectoId) =>
  client.get(`/proyectos/${proyectoId}/backlog`)

export const getResumen = (proyectoId) =>
  client.get(`/proyectos/${proyectoId}/resumen`)

export const getExcel = (proyectoId) =>
  client.get(`/proyectos/${proyectoId}/excel`, { responseType: 'blob' })

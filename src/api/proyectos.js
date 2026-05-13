import api from './axios'

export const getProyectos = () =>
  api.get('/proyectos')

export const getProyecto = (id) =>
  api.get(`/proyectos/${id}`)

export const createProyecto = (data) =>
  api.post('/proyectos', data)

export const updateProyecto = (id, data) =>
  api.put(`/proyectos/${id}`, data)

export const deleteProyecto = (id) =>
  api.delete(`/proyectos/${id}`)

export const getBacklog = (id) =>
  api.get(`/proyectos/${id}/backlog`)

export const getResumen = (id) =>
  api.get(`/proyectos/${id}/resumen`)

export const descargarExcel = async (id) => {
  const response = await api.get(`/proyectos/${id}/excel`, {
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url

  const disposition = response.headers['content-disposition'] ?? ''
  const match = disposition.match(/filename="?([^"]+)"?/)
  link.download = match ? match[1] : `Backlog_${id}.xlsx`

  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

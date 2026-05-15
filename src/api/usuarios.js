import api from './axios'

export const getUsuarios        = (params) => api.get('/usuarios', { params })
export const createUsuario      = (data)   => api.post('/usuarios', data)
export const deleteUsuario      = (id)     => api.delete(`/usuarios/${id}`)
export const toggleActivoUsuario = (id)   => api.patch(`/usuarios/${id}/toggle-activo`)

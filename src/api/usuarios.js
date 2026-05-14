import api from './axios'

export const getUsuarios   = (params) => api.get('/usuarios', { params })
export const createUsuario = (data)   => api.post('/usuarios', data)

import api from './axios'

export const getFichas    = ()     => api.get('/fichas')
export const createFicha  = (data) => api.post('/fichas', data)

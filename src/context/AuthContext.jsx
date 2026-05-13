import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Al montar: si hay token en localStorage carga el usuario
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(res => setUsuario(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
  const res = await apiLogin(email, password)
  const { token: tokenObj, usuario } = res.data     
  const nuevoToken = tokenObj.token             
  localStorage.setItem('token', nuevoToken)
  setToken(nuevoToken)
  setUsuario(usuario)
  return usuario
}

  async function logout() {
    await apiLogout().catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('proyectoActivo')
    setToken(null)
    setUsuario(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

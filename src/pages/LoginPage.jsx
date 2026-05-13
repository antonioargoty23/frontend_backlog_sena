import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoSena from '../assets/logoSena.png'
import '../styles/login.css'

export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <img src={logoSena} alt="SENA" />
          <div>
            <div className="login-brand-name">SENA <strong>CTPI</strong></div>
            <div className="login-brand-sub">Product Backlog del Proyecto Formativo</div>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@sena.edu.co"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-submit"
            disabled={cargando}
          >
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

      </div>
    </div>
  )
}

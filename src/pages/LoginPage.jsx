import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoSena from '../assets/logoSena.png'
import '../styles/variables.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)', padding: '40px 36px',
        width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <img src={logoSena} alt="SENA" style={{ width: 40, height: 40 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              SENA <strong>CTPI</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              PRODUCT BACKLOG DEL PROYECTO FORMATIVO
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="form-row">
            <label className="form-label">Correo electrónico</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@sena.edu.co"
              required
            />
          </div>
          <div className="form-row">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--priority-alta-text)', background: 'var(--priority-alta-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--priority-alta-border)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-modal-save"
            style={{ marginTop: 4, padding: '10px 0', width: '100%', fontSize: 14 }}
            disabled={loading}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

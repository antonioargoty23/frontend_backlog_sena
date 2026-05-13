import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { usuario, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        Cargando...
      </div>
    )
  }

  return usuario ? children : <Navigate to="/login" replace />
}

import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import ProyectosPage  from './pages/ProyectosPage'
import BacklogPage    from './pages/BacklogPage'
import AdminPage      from './pages/AdminPage'

function BacklogRoute() {
  const { id } = useParams()
  return (
    <AppProvider proyectoId={id}>
      <BacklogPage />
    </AppProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas privadas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/proyectos" element={
            <ProtectedRoute>
              <ProyectosPage />
            </ProtectedRoute>
          } />

          <Route path="/proyectos/:id" element={
            <ProtectedRoute>
              <BacklogRoute />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />

          {/* Raíz → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

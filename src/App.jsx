import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import ProyectosPage  from './pages/ProyectosPage'
import BacklogPage    from './pages/BacklogPage'

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
              <AppProvider>
                <BacklogPage />
              </AppProvider>
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

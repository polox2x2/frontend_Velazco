import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();

  // Si no hay sesión o el usuario es cliente, redirige a la página principal
  if (!isAuthenticated || user?.rol === 'Cliente') {
    return <Navigate to="/" replace />;
  }

  // Si hay sesión de admin, renderiza las rutas hijas
  return <Outlet />;
}

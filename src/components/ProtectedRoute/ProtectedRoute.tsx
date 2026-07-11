import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si hay token, renderiza las rutas hijas (AdminLayout y los modulos)
  return <Outlet />;
}

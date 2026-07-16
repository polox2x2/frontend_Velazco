import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout/MainLayout'
import AdminLayout from '../layouts/AdminLayout/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import Home from '../pages/Home/Home'
import Tienda from '../pages/Tienda/Tienda'
import Testimonios from '../pages/Testimonios/Testimonios'
import Contacto from '../pages/Contacto/Contacto'
import Checkout from '../pages/Checkout/Checkout'
import Dashboard from '../pages/Admin/Dashboard/Dashboard'
import Inventario from '../pages/Admin/Inventario/Inventario'
import Pedidos from '../pages/Admin/Pedidos/Pedidos'
import Caja from '../pages/Admin/Caja/Caja'
import Entregas from '../pages/Admin/Entregas/Entregas'
import Produccion from '../pages/Admin/Produccion/Produccion'
import Usuarios from '../pages/Admin/Usuarios/Usuarios'

function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas de la tienda */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/testimonios" element={<Testimonios />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:status" element={<Checkout />} />
      </Route>

      {/* Rutas protegidas de administrador */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="caja" element={<Caja />} />
          <Route path="entregas" element={<Entregas />} />
          <Route path="produccion" element={<Produccion />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="*" element={<div style={{padding: '2rem'}}>Módulo en construcción</div>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRouter

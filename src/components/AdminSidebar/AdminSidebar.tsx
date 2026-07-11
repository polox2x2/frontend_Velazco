import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingBag, 
  MonitorCheck, 
  Truck, 
  ChefHat,
  ClipboardList,
  Users,
  LogOut
} from 'lucide-react';
import styles from './AdminSidebar.module.css';
import { authApi } from '../../services/api';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/inventario', icon: <PackageSearch size={20} />, label: 'Inventario' },
    { path: '/admin/pedidos', icon: <ShoppingBag size={20} />, label: 'Pedidos en Tienda' },
    { path: '/admin/caja', icon: <MonitorCheck size={20} />, label: 'Caja' },
    { path: '/admin/entregas', icon: <Truck size={20} />, label: 'Entregas' },
    { path: '/admin/produccion', icon: <ChefHat size={20} />, label: 'Producción' },
    { path: '/admin/ordenes', icon: <ClipboardList size={20} />, label: 'Órdenes' },
    { path: '/admin/usuarios', icon: <Users size={20} />, label: 'Usuarios' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/img/logo.png" alt="Velazco Logo" className={styles.logo} />
        <h2 className={styles.title}>Admin Panel</h2>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

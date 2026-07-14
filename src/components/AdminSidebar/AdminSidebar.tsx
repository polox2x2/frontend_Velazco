import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingBag, 
  MonitorCheck, 
  Truck, 
  ChefHat,
  Users,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import styles from './AdminSidebar.module.css';
import { authApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function AdminSidebar({ isDarkMode, toggleDarkMode }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['Administrador', 'Producción'] },
    { path: '/admin/inventario', icon: <PackageSearch size={20} />, label: 'Inventario', roles: ['Administrador'] },
    { path: '/admin/pedidos', icon: <ShoppingBag size={20} />, label: 'Pedidos en Tienda', roles: ['Administrador', 'Cajero'] },
    { path: '/admin/caja', icon: <MonitorCheck size={20} />, label: 'Caja', roles: ['Administrador', 'Cajero'] },
    { path: '/admin/entregas', icon: <Truck size={20} />, label: 'Entregas', roles: ['Administrador', 'Cajero', 'Entregas'] },
    { path: '/admin/produccion', icon: <ChefHat size={20} />, label: 'Producción', roles: ['Administrador', 'Producción'] },
    { path: '/admin/usuarios', icon: <Users size={20} />, label: 'Usuarios', roles: ['Administrador'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.rol));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/img/logo.png" alt="Velazco Logo" className={styles.logo} />
        <h2 className={styles.title}>Admin Panel</h2>
        {user && <span className={styles.userRoleBadge}>{user.rol}</span>}
      </div>

      <nav className={styles.nav}>
        {filteredNavItems.map((item) => (
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
        {toggleDarkMode && (
          <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

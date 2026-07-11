import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import AdminChatBubble from '../../components/AdminChatBubble/AdminChatBubble';
import styles from './AdminLayout.module.css';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { user } = useAuth();
  
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      {user?.rol === 'Administrador' && <AdminChatBubble />}
    </div>
  );
}

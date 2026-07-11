import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import AdminChatBubble from '../../components/AdminChatBubble/AdminChatBubble';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <AdminChatBubble />
    </div>
  );
}

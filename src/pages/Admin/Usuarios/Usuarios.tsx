import { UserPlus } from 'lucide-react';
import styles from './Usuarios.module.css';

export default function Usuarios() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Usuarios</h1>
        <button className={styles.btnPrimary}>
          <UserPlus size={18} style={{display:'inline', marginRight: 8, verticalAlign:'middle'}}/>
          Nuevo Usuario
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Eduardo Velazco</td>
              <td>admin@velazco.com</td>
              <td><span className={styles.roleBadge}>Administrador</span></td>
              <td>Hace 5 min</td>
              <td>Editar | Desactivar</td>
            </tr>
            <tr>
              <td>Carlos Panadero</td>
              <td>carlos@velazco.com</td>
              <td><span className={styles.roleBadge}>Producción</span></td>
              <td>Ayer</td>
              <td>Editar | Desactivar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

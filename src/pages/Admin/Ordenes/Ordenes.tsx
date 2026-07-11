import { Plus } from 'lucide-react';
import styles from './Ordenes.module.css';

export default function Ordenes() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Órdenes de Producción</h1>
        <button className={styles.btnPrimary}>
          <Plus size={18} style={{display:'inline', marginRight: 8, verticalAlign:'middle'}}/>
          Nueva Orden
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.taskCard}>
          <div className={styles.taskTitle}>Hornear Pan Francés</div>
          <div className={styles.taskDesc}>Cantidad: 200 uds. Prioridad Alta.</div>
          <div className={styles.taskFooter}>
            <span className={styles.assignee}>Panadero: Carlos</span>
            <select className={styles.statusSelect}>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
            </select>
          </div>
        </div>

        <div className={styles.taskCard}>
          <div className={styles.taskTitle}>Preparar Tartas de Manzana</div>
          <div className={styles.taskDesc}>Cantidad: 5 uds. Para las 15:00.</div>
          <div className={styles.taskFooter}>
            <span className={styles.assignee}>Pastelera: María</span>
            <select className={styles.statusSelect}>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

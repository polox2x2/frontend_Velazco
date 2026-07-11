import { useState, useEffect } from 'react';
import styles from './Entregas.module.css';
import { adminApi } from '../../../services/api';
import { Truck, Check, Package, Clock, User, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Entregas() {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagadoRes, entregadoRes] = await Promise.all([
        adminApi.getOrdersByStatus('PAGADO', 0, 50),
        adminApi.getDeliveredOrders(0, 20),
      ]);
      setPendingOrders(pagadoRes.content || []);
      setDeliveredOrders(entregadoRes.content || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDispatch = async (orderId: number) => {
    const result = await Swal.fire({
      title: '¿Confirmar entrega?',
      text: '¿Confirmar entrega de este pedido?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#27ae60',
      confirmButtonText: 'Sí, entregar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      await adminApi.confirmDispatch(orderId);
      Swal.fire('¡Éxito!', 'Pedido marcado como Entregado.', 'success');
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al confirmar la entrega.', 'error');
    }
  };

  const calculateTotal = (details: any[]) => {
    if (!details) return 0;
    return details.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Truck className={styles.titleIcon} size={28} />
          Entregas (Logística)
        </h1>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
          {loading ? 'Actualizando...' : '↻ Actualizar'}
        </button>
      </div>

      <div className={styles.kanban}>
        {/* COLUMN: Por Despachar */}
        <div className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.headerPending}`}>
            <Package size={18} />
            <span>Por Despachar ({pendingOrders.length})</span>
          </div>
          {pendingOrders.length === 0 ? (
            <div className={styles.emptyCol}>No hay pedidos por despachar</div>
          ) : (
            pendingOrders.map((order) => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardOrderId}>Pedido #{order.id}</span>
                  <span className={styles.cardBadgePaid}>Pagado</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <User size={14} className={styles.rowIcon} />
                    <span>{order.clientName}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <Clock size={14} className={styles.rowIcon} />
                    <span>{new Date(order.date).toLocaleString()}</span>
                  </div>
                  <div className={styles.cardProducts}>
                    {order.details?.map((d: any, i: number) => (
                      <span key={i} className={styles.productTag}>
                        {d.product?.name || 'Producto'} <strong className={styles.qty}>x{d.quantity}</strong>
                      </span>
                    ))}
                  </div>
                  <div className={styles.cardTotal}>
                    Total: S/. {calculateTotal(order.details).toFixed(2)}
                  </div>
                </div>
                <button className={styles.dispatchBtn} onClick={() => handleConfirmDispatch(order.id)}>
                  <Check size={16} /> Marcar como Entregado
                </button>
              </div>
            ))
          )}
        </div>

        {/* COLUMN: Entregados Hoy */}
        <div className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.headerDelivered}`}>
            <Check size={18} />
            <span>Entregados ({deliveredOrders.length})</span>
          </div>
          {deliveredOrders.length === 0 ? (
            <div className={styles.emptyCol}>No hay entregas registradas aún</div>
          ) : (
            deliveredOrders.map((order) => (
              <div key={order.id} className={`${styles.card} ${styles.cardDelivered}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardOrderId}>Pedido #{order.id}</span>
                  <span className={styles.cardBadgeDelivered}>Entregado</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <User size={14} className={styles.rowIcon} />
                    <span>{order.clientName}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <Clock size={14} className={styles.rowIcon} />
                    <span>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleString() : new Date(order.date).toLocaleString()}</span>
                  </div>
                  {order.deliveredBy && (
                    <div className={styles.cardRow}>
                      <MapPin size={14} className={styles.rowIcon} />
                      <span>Entregado por: <strong>{order.deliveredBy.name}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

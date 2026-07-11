import { useState, useEffect } from 'react';
import styles from './Pedidos.module.css';
import { adminApi } from '../../../services/api';
import { ShoppingBag, X, Check, Search, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Pedidos() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PAGADO'); // By default, show Paid (ready to be dispatched)
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrdersByStatus(statusFilter, 0, 50);
      setOrders(response.content || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmDispatch = async (orderId: number) => {
    const result = await Swal.fire({
      title: '¿Confirmar entrega?',
      text: "¿Estás seguro de marcar este pedido como entregado?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#27ae60',
      cancelButtonColor: '#e74c3c',
      confirmButtonText: 'Sí, entregar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      await adminApi.confirmDispatch(orderId);
      Swal.fire('¡Éxito!', 'Pedido marcado como Entregado.', 'success');
      fetchOrders();
      if (isModalOpen) handleCloseModal();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al confirmar la entrega.', 'error');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const result = await Swal.fire({
      title: '¿Cancelar pedido?',
      text: "El stock será retornado al inventario automáticamente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Cerrar'
    });
    if (!result.isConfirmed) return;

    try {
      await adminApi.cancelOrder(orderId);
      Swal.fire('Cancelado', 'Pedido cancelado exitosamente.', 'success');
      fetchOrders();
      if (isModalOpen) handleCloseModal();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al cancelar el pedido.', 'error');
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    const result = await Swal.fire({
      title: '¿Confirmar pago manual?',
      text: "¿Confirmar que este pedido ha sido pagado (marcarlo manualmente)?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#e74c3c',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      await adminApi.confirmSale(orderId, 'Manual/Efectivo');
      Swal.fire('¡Éxito!', 'Pedido marcado como Pagado exitosamente.', 'success');
      fetchOrders();
      if (isModalOpen) handleCloseModal();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Ocurrió un error al confirmar el pago.', 'error');
    }
  };

  const calculateTotal = (details: any[]) => {
    if (!details) return 0;
    return details.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'PENDIENTE': return styles.badgePending;
      case 'PAGADO': return styles.badgePaid;
      case 'ENTREGADO': return styles.badgeDelivered;
      case 'CANCELADO': return styles.badgeCancelled;
      default: return styles.badgeDefault;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <ShoppingBag className={styles.titleIcon} />
          Pedidos en Tienda
        </h1>
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input type="text" placeholder="Buscar por cliente o N°..." className={styles.searchInput} disabled />
          </div>
          <select 
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="PENDIENTE">Pendientes (Por Pagar)</option>
            <option value="PAGADO">Pagados (Por Entregar)</option>
            <option value="ENTREGADO">Entregados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N° Pedido</th>
              <th>Cliente</th>
              <th>Fecha/Hora</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Cargando pedidos...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{textAlign: 'center', padding: '2rem', color: '#888'}}>
                  No hay pedidos en estado {statusFilter}.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className={styles.orderId}>#{order.id}</td>
                  <td className={styles.clientName}>{order.clientName}</td>
                  <td>{new Date(order.date).toLocaleString()}</td>
                  <td className={styles.orderTotal}>S/. {calculateTotal(order.details).toFixed(2)}</td>
                  <td><span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.btnView} onClick={() => handleOpenDetails(order)}>Ver Detalles</button>
                      
                      {order.status === 'PAGADO' && (
                        <button className={styles.btnDispatch} onClick={() => handleConfirmDispatch(order.id)}>
                          <Check size={16} /> Entregar
                        </button>
                      )}

                      {order.status === 'PENDIENTE' && (
                        <>
                          <button className={styles.btnDispatch} style={{ backgroundColor: '#2ecc71' }} onClick={() => handleConfirmPayment(order.id)}>
                            <Check size={16} /> Confirmar Pago
                          </button>
                          <button className={styles.btnCancel} onClick={() => handleCancelOrder(order.id)}>
                            <X size={16} /> Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detalles del Pedido */}
      {isModalOpen && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalles del Pedido #{selectedOrder.id}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.orderInfoGrid}>
                <div className={styles.infoGroup}>
                  <span className={styles.infoLabel}>Cliente:</span>
                  <span className={styles.infoValue}>{selectedOrder.clientName}</span>
                </div>
                <div className={styles.infoGroup}>
                  <span className={styles.infoLabel}>Fecha:</span>
                  <span className={styles.infoValue}>{new Date(selectedOrder.date).toLocaleString()}</span>
                </div>
                <div className={styles.infoGroup}>
                  <span className={styles.infoLabel}>Estado:</span>
                  <span className={`${styles.badge} ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
                <div className={styles.infoGroup}>
                  <span className={styles.infoLabel}>Atendido por:</span>
                  <span className={styles.infoValue}>{selectedOrder.attendedBy?.name || 'Sistema'}</span>
                </div>
              </div>
              
              <h3 className={styles.productsTitle}>Productos</h3>
              <div className={styles.productsList}>
                {selectedOrder.details?.map((item: any, index: number) => (
                  <div key={index} className={styles.productItem}>
                    <div className={styles.prodDetails}>
                      <span className={styles.prodName}>{item.product?.name || 'Producto Desconocido'}</span>
                      <span className={styles.prodQty}>x{item.quantity}</span>
                    </div>
                    <span className={styles.prodPrice}>S/. {(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className={styles.modalFooterRow}>
                <span className={styles.modalTotalLabel}>Total:</span>
                <span className={styles.modalTotalValue}>S/. {calculateTotal(selectedOrder.details).toFixed(2)}</span>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              {selectedOrder.status === 'PAGADO' && (
                <button className={styles.btnDispatchLg} onClick={() => handleConfirmDispatch(selectedOrder.id)}>
                  <Check size={18} /> Marcar como Entregado
                </button>
              )}
              {selectedOrder.status === 'PENDIENTE' && (
                <>
                  <button className={styles.btnDispatchLg} style={{ backgroundColor: '#2ecc71', marginRight: '10px' }} onClick={() => handleConfirmPayment(selectedOrder.id)}>
                    <Check size={18} /> Confirmar Pago
                  </button>
                  <button className={styles.btnCancelLg} onClick={() => handleCancelOrder(selectedOrder.id)}>
                    <AlertCircle size={18} /> Cancelar Pedido
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

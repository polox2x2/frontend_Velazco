import { useState, useEffect } from 'react';
import styles from './Produccion.module.css';
import { adminApi } from '../../../services/api';
import { ChefHat, ClipboardList, Flame, CheckCircle, User, Calendar, Plus, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Produccion() {
  const [pending, setPending] = useState<any[]>([]);
  const [inProcess, setInProcess] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // New Production state
  const [newProdDate, setNewProdDate] = useState(new Date().toISOString().split('T')[0]);
  const [newProdAssignedTo, setNewProdAssignedTo] = useState('');
  const [newProdComments, setNewProdComments] = useState('');
  const [newProdDetails, setNewProdDetails] = useState<{ productId: string, requestedQuantity: number }[]>([]);

  useEffect(() => {
    fetchData();
    fetchFormData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, inProcessRes] = await Promise.all([
        adminApi.getPendingProductions(),
        adminApi.getInProcessProductions()
      ]);
      setPending(pendingRes || []);
      setInProcess(inProcessRes || []);
    } catch (error) {
      console.error('Error fetching productions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [usersRes, productsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getProducts()
      ]);
      setUsers(usersRes || []);
      setProducts(productsRes || []);
    } catch (error) {
      console.error('Error fetching users/products:', error);
    }
  };

  const handleStartProduction = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Empezar orden?',
      text: "¿Deseas empezar esta orden de producción?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, empezar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      await adminApi.updateProductionStatus(id, 'EN_PROCESO');
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al actualizar estado.', 'error');
    }
  };

  const handleFinalizeProduction = async (id: number, details: any[]) => {
    const result = await Swal.fire({
      title: '¿Finalizar orden?',
      text: "¿Finalizar orden y añadir productos al inventario?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#27ae60',
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      const payload = {
        details: details.map((d: any) => ({
          productId: d.product.id,
          producedQuantity: d.requestedQuantity
        }))
      };
      await adminApi.finalizeProduction(id, payload);
      fetchData();
      Swal.fire('¡Listo!', 'Producción finalizada. El inventario ha sido actualizado.', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al finalizar producción.', 'error');
    }
  };

  // Form Handlers
  const openModal = () => {
    setNewProdDate(new Date().toISOString().split('T')[0]);
    setNewProdAssignedTo('');
    setNewProdComments('');
    setNewProdDetails([]);
    setIsModalOpen(true);
  };

  const addDetailRow = () => {
    setNewProdDetails([...newProdDetails, { productId: '', requestedQuantity: 1 }]);
  };

  const updateDetailRow = (index: number, field: string, value: any) => {
    const updated = [...newProdDetails];
    updated[index] = { ...updated[index], [field]: value };
    setNewProdDetails(updated);
  };

  const removeDetailRow = (index: number) => {
    const updated = newProdDetails.filter((_, i) => i !== index);
    setNewProdDetails(updated);
  };

  const handleCreateProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdAssignedTo) {
      Swal.fire('Atención', 'Debes asignar un responsable.', 'warning');
      return;
    }
    if (newProdDetails.length === 0) {
      Swal.fire('Atención', 'Debes agregar al menos un producto.', 'warning');
      return;
    }
    if (newProdDetails.some(d => !d.productId || d.requestedQuantity <= 0)) {
      Swal.fire('Atención', 'Verifica los productos y cantidades ingresadas.', 'warning');
      return;
    }

    try {
      const payload = {
        productionDate: newProdDate,
        assignedToId: parseInt(newProdAssignedTo),
        status: 'PENDIENTE',
        comments: newProdComments,
        details: newProdDetails.map(d => ({
          productId: parseInt(d.productId),
          requestedQuantity: d.requestedQuantity
        }))
      };

      await adminApi.createProduction(payload);
      Swal.fire('¡Éxito!', 'Orden de producción creada correctamente.', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error creating production:', error);
      const backendMsg = error.response?.data?.message || error.response?.data || 'Verifica los datos.';
      Swal.fire('Error', `Error al crear orden de producción: ${typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg)}`, 'error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <ChefHat size={28} className={styles.titleIcon} /> Producción Interna
        </h1>
        <div className={styles.headerActions}>
          <button className={styles.newBtn} onClick={openModal}>
            <Plus size={16} /> Nueva Orden
          </button>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
            {loading ? 'Actualizando...' : '↻ Actualizar'}
          </button>
        </div>
      </div>

      <div className={styles.kanban}>
        {/* COLUMN: PENDIENTE */}
        <div className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.headerPending}`}>
            <ClipboardList size={18} />
            Pendientes ({pending.length})
          </div>
          {pending.length === 0 ? (
            <div className={styles.emptyCol}>No hay órdenes pendientes</div>
          ) : (
            pending.map((order) => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardId}>Orden #{order.id}</span>
                  <span className={styles.cardDate}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {order.productionDate}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>Asignado a: <strong>{order.assignedTo?.name || 'N/A'}</strong></span>
                  </div>
                  {order.comments && (
                    <div className={styles.cardComments}>"{order.comments}"</div>
                  )}
                  <div className={styles.cardProducts}>
                    {order.details?.map((d: any, i: number) => (
                      <div key={i} className={styles.productRow}>
                        <span>{d.product?.name}</span>
                        <span className={styles.qty}>x{d.requestedQuantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className={styles.actionBtn} onClick={() => handleStartProduction(order.id)}>
                  <Flame size={16} /> Empezar Producción
                </button>
              </div>
            ))
          )}
        </div>

        {/* COLUMN: EN PROCESO */}
        <div className={styles.column}>
          <div className={`${styles.columnHeader} ${styles.headerInProcess}`}>
            <Flame size={18} />
            En Proceso ({inProcess.length})
          </div>
          {inProcess.length === 0 ? (
            <div className={styles.emptyCol}>No hay órdenes en proceso</div>
          ) : (
            inProcess.map((order) => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardId}>Orden #{order.id}</span>
                  <span className={styles.cardDate}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {order.productionDate}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>Asignado a: <strong>{order.assignedTo?.name || 'N/A'}</strong></span>
                  </div>
                  {order.comments && (
                    <div className={styles.cardComments}>"{order.comments}"</div>
                  )}
                  <div className={styles.cardProducts}>
                    {order.details?.map((d: any, i: number) => (
                      <div key={i} className={styles.productRow}>
                        <span>{d.product?.name}</span>
                        <span className={styles.qty}>x{d.requestedQuantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className={styles.successBtn} onClick={() => handleFinalizeProduction(order.id, order.details)}>
                  <CheckCircle size={16} /> Finalizar Producción
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL NUEVA PRODUCCIÓN */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Nueva Orden de Producción</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProduction} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Fecha de Producción</label>
                  <input 
                    type="date" 
                    value={newProdDate} 
                    onChange={(e) => setNewProdDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Asignado A (Responsable)</label>
                  <select 
                    value={newProdAssignedTo} 
                    onChange={(e) => setNewProdAssignedTo(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccionar Usuario --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Notas / Comentarios (Opcional)</label>
                <textarea 
                  rows={2} 
                  placeholder="Ej: Prioridad alta para evento..."
                  value={newProdComments}
                  onChange={(e) => setNewProdComments(e.target.value)}
                />
              </div>

              <div className={styles.detailsSection}>
                <div className={styles.detailsHeader}>
                  <h3>Productos a Preparar</h3>
                  <button type="button" className={styles.addDetailBtn} onClick={addDetailRow}>
                    <Plus size={14} /> Añadir Producto
                  </button>
                </div>
                
                {newProdDetails.length === 0 ? (
                  <p className={styles.noDetails}>No hay productos agregados.</p>
                ) : (
                  <div className={styles.detailsList}>
                    {newProdDetails.map((detail, index) => (
                      <div key={index} className={styles.detailRow}>
                        <select 
                          className={styles.productSelect}
                          value={detail.productId}
                          onChange={(e) => updateDetailRow(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">-- Seleccionar Producto --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Stock act: {p.stockQuantity})</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          min="1"
                          placeholder="Cant."
                          className={styles.qtyInput}
                          value={detail.requestedQuantity}
                          onChange={(e) => updateDetailRow(index, 'requestedQuantity', parseInt(e.target.value) || 0)}
                          required
                        />
                        <button 
                          type="button" 
                          className={styles.removeDetailBtn}
                          onClick={() => removeDetailRow(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Crear Orden de Producción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

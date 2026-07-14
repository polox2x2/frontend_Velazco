import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminApi, publicApi } from '../../../services/api';
import styles from './Inventario.module.css';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../../utils/image';

interface ProductAdmin {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
  active: boolean;
  category: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

export default function Inventario() {
  const [products, setProducts] = useState<ProductAdmin[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    active: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        adminApi.getProducts(),
        publicApi.getCategories()
      ]);
      // Sort products by ID to keep the order stable
      setProducts(prodData.sort((a: ProductAdmin, b: ProductAdmin) => a.id - b.id));
      setCategories(catData);
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleOpenModal = (product?: ProductAdmin) => {
    if (product) {
      setEditingProductId(product.id);
      setFormData({
        name: product.name,
        price: String(product.price),
        stock: String(product.stock),
        categoryId: product.category ? String(product.category.id) : (categories.length > 0 ? String(categories[0].id) : ''),
        active: product.active
      });
    } else {
      setEditingProductId(null);
      setFormData({ name: '', price: '', stock: '', categoryId: categories.length > 0 ? String(categories[0].id) : '', active: true });
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
      Swal.fire('Atención', 'Por favor completa todos los campos requeridos.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const form = new FormData();
      form.append('name', formData.name);
      form.append('price', formData.price);
      form.append('stock', formData.stock);
      form.append('categoryId', formData.categoryId);
      form.append('active', String(formData.active));
      
      if (selectedImage) {
        form.append('image', selectedImage);
      }

      if (editingProductId) {
        await adminApi.updateProduct(editingProductId, form);
      } else {
        await adminApi.createProduct(form);
      }
      
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product", error);
      Swal.fire('Error', 'Ocurrió un error al guardar el producto.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que deseas eliminar el producto "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await adminApi.deleteProduct(id);
        await fetchData();
        Swal.fire('Eliminado', 'Producto eliminado exitosamente.', 'success');
      } catch (error) {
        console.error("Error deleting product", error);
        Swal.fire('Error', 'No se pudo eliminar el producto. Verifica que no tenga pedidos asociados.', 'error');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventario</h1>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} style={{display:'inline', marginRight: 8, verticalAlign:'middle'}} className={loading ? styles.spin : ''}/>
            Actualizar
          </button>
          <input type="text" placeholder="Buscar producto..." className={styles.searchInput} />
          <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
            <Plus size={18} style={{display:'inline', marginRight: 8, verticalAlign:'middle'}}/>
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{textAlign:'center', padding:'2rem'}}>Cargando productos...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} style={{textAlign:'center', padding:'2rem'}}>No hay productos registrados.</td></tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id}>
                  <td>#{prod.id}</td>
                  <td>
                    <img 
                      src={getImageUrl(prod.image)} 
                      alt={prod.name} 
                      onError={(e) => { e.currentTarget.src = '/img/hero-products.png'; }}
                    />
                  </td>
                  <td style={{fontWeight: 600}}>{prod.name}</td>
                  <td>{prod.category?.name || '-'}</td>
                  <td>S/. {prod.price.toFixed(2)}</td>
                  <td>{prod.stock}</td>
                  <td>
                    <span className={prod.active ? styles.badge : styles.badgeInactive}>
                      {prod.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn} title="Editar" onClick={() => handleOpenModal(prod)}><Edit2 size={16}/></button>
                    <button className={styles.actionBtn} title="Eliminar" style={{color: '#e74c3c'}} onClick={() => handleDelete(prod.id, prod.name)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>{editingProductId ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nombre del Producto *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Categoría *</label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  required
                >
                  <option value="" disabled>Seleccione una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Precio (S/.) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Stock *</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Imagen del Producto {editingProductId && '(Dejar en blanco para conservar actual)'}</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />
              </div>
              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="active" style={{ marginBottom: 0 }}>Producto Activo</label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={handleCloseModal} disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : (editingProductId ? 'Guardar Cambios' : 'Guardar Producto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

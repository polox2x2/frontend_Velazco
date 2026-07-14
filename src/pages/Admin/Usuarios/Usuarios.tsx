import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import styles from './Usuarios.module.css';
import { adminApi } from '../../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active?: boolean;
}

const roleToId: Record<string, number> = {
  'Administrador': 1,
  'Cajero': 2,
  'Vendedor': 3,
  'Producción': 4,
  'Entregas': 5
};

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    email: '',
    password: '',
    role: 'Cajero'
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      // filter out clientes if needed, but the backend might return all users.
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ id: 0, name: '', email: '', password: '', role: 'Cajero' });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setFormData({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role || 'Cajero' 
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await adminApi.deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error('Error deleting user', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await adminApi.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          active: true,
          roleId: roleToId[formData.role] || 2
        });
      } else {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          active: true,
          roleId: roleToId[formData.role] || 2
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await adminApi.updateUser(formData.id, updateData);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving user', error);
      alert('Error al guardar el usuario');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Usuarios</h1>
        <button className={styles.btnPrimary} onClick={openCreateModal}>
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{textAlign:'center', padding: '2rem'}}>Cargando usuarios...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} style={{textAlign:'center', padding: '2rem'}}>No hay usuarios registrados</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles['role' + (user.role || '').replace(/\s+/g, '')] || ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.btnEdit} onClick={() => openEditModal(user)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(user.id)} title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Contraseña {modalMode === 'edit' && <small>(dejar en blanco para mantener actual)</small>}</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required={modalMode === 'create'}
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button" 
                    className={styles.passwordToggleBtn} 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Rol</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Producción">Producción</option>
                  <option value="Entregas">Entregas</option>
                  <option value="Vendedor">Vendedor</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.btnSave}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password }) as any;
      if (response.token && response.user) {
        login(response.token, response.user);
        
        // Redirect depending on role
        if (response.user.rol === 'Cajero') {
          navigate('/admin/caja');
        } else if (response.user.rol === 'Entregas') {
          navigate('/admin/entregas');
        } else if (response.user.rol === 'Producción') {
          navigate('/admin/produccion');
        } else if (response.user.rol === 'Cliente') {
          navigate('/'); // Si un cliente intenta entrar al admin, se va al home
        } else {
          navigate('/admin/dashboard'); // Administrador y Vendedor van al dashboard
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/img/logo.png" alt="Velazco Logo" />
        </div>
        <h2 className={styles.title}>Panel de Administración</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="admin@velazco.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

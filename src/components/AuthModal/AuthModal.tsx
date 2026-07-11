import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNombreCompleto('');
    setTelefono('');
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authApi.clientLogin({ email, password }) as any;
        if (response.token && response.user) {
          login(response.token, response.user);
          onClose();
          if (response.user.rol === 'Cajero') {
            navigate('/admin/caja');
          } else if (response.user.rol !== 'Cliente') {
            navigate('/admin/dashboard');
          }
        }
      } else {
        const response = await authApi.clientRegister({ nombreCompleto, email, telefono, password }) as any;
        if (response.token && response.user) {
          login(response.token, response.user);
          onClose();
          if (response.user.rol === 'Cajero') {
            navigate('/admin/caja');
          } else if (response.user.rol !== 'Cliente') {
            navigate('/admin/dashboard');
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      if (isLogin) {
        setError('Credenciales inválidas. Por favor intenta de nuevo.');
      } else {
        setError('Ocurrió un error al registrar. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
          &times;
        </button>
        
        <div className={styles.headerText}>
          <div className={styles.iconWrapper}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 className={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p className={styles.subtitle}>
            {isLogin 
              ? 'Ingresa a tu cuenta para comprar más rápido' 
              : 'Regístrate para gestionar tus pedidos fácilmente'}
          </p>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre Completo</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Ej. Juan Pérez"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono</label>
              <input 
                type="tel" 
                className={styles.input} 
                placeholder="Ej. 987654321"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder={isLogin ? '********' : 'Mínimo 6 caracteres'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? undefined : 6}
            />
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading 
              ? (isLogin ? 'Ingresando...' : 'Creando cuenta...') 
              : (isLogin ? 'Iniciar Sesión' : 'Registrarme')}
          </button>
        </form>

        <div className={styles.footer}>
          <span>{isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}</span>
          <button type="button" onClick={toggleMode} className={styles.link}>
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}

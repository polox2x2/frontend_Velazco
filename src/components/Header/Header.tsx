import { useState } from 'react'
import { Link } from 'react-router-dom'
import CartIcon from '../CartIcon/CartIcon'
import CartDrawer from '../CartDrawer/CartDrawer'
import AuthModal from '../AuthModal/AuthModal'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Header.module.css'

interface HeaderProps {
  onToggleSidebar: () => void
  busqueda: string
  onCambiarBusqueda: (valor: string) => void
}

function Header({ onToggleSidebar, busqueda, onCambiarBusqueda }: HeaderProps) {
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [authModalAbierto, setAuthModalAbierto] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <>
      <header className={styles.header}>
        <button
          className={styles.hamburger}
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className={styles.center}>
          <div className={styles.searchBar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => onCambiarBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                className={styles.clearSearch}
                onClick={() => onCambiarBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className={styles.right}>
          {isAuthenticated && user ? (
            <div className={styles.authContainer}>
              <span className={styles.userName}>Hola, {user.nombreCompleto.split(' ')[0]}</span>
              <button onClick={logout} className={styles.btnLogout} aria-label="Cerrar sesión">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <div className={styles.authContainer}>
              <button onClick={() => setAuthModalAbierto(true)} className={styles.btnLogin} aria-label="Ingresar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            </div>
          )}
          <Link to="/contacto" className={styles.btnContact}>
            Contáctanos
          </Link>
          <CartIcon onClick={() => setCarritoAbierto(true)} />
        </div>
      </header>
      <CartDrawer
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
      />
      <AuthModal
        isOpen={authModalAbierto}
        onClose={() => setAuthModalAbierto(false)}
      />
    </>
  )
}

export default Header

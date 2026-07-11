import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import CartItemRow from '../CartItemRow/CartItemRow'
import styles from './CartDrawer.module.css'

interface CartDrawerProps {
  abierto: boolean
  onCerrar: () => void
}

function CartDrawer({ abierto, onCerrar }: CartDrawerProps) {
  const { items, total, cantidadTotal, limpiarCarrito } = useCart()
  const navigate = useNavigate()

  const handlePagar = () => {
    onCerrar()
    navigate('/checkout')
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${abierto ? styles.overlayVisible : ''}`}
        onClick={onCerrar}
        aria-hidden="true"
      />
      <aside
        className={`${styles.drawer} ${abierto ? styles.drawerOpen : ''}`}
        aria-label="Carrito de compras"
        role="dialog"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            Carrito
            {cantidadTotal > 0 && (
              <span className={styles.count}>({cantidadTotal})</span>
            )}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onCerrar}
            aria-label="Cerrar carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ddd"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className={styles.emptyText}>Tu carrito está vacío</p>
            <p className={styles.emptySubtext}>
              Agrega productos para empezar tu pedido
            </p>
            <button className={styles.continueBtn} onClick={onCerrar}>
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className={styles.itemsList}>
              {items.map((item) => (
                <CartItemRow key={item.producto.id} item={item} />
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>
                  S/ {total.toFixed(2)}
                </span>
              </div>
              <button className={styles.payBtn} onClick={handlePagar}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Pagar
              </button>
              <button
                className={styles.clearBtn}
                onClick={limpiarCarrito}
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

export default CartDrawer

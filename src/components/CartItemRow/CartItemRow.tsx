import type { CartItem } from '../../interfaces/CartItem'
import { useCart } from '../../contexts/CartContext'
import styles from './CartItemRow.module.css'
import { getImageUrl } from '../../utils/image'

interface CartItemRowProps {
  item: CartItem
}

function CartItemRow({ item }: CartItemRowProps) {
  const { actualizarCantidad, removerDelCarrito } = useCart()
  const { producto, cantidad } = item

  return (
    <div className={styles.row}>
      <img
        src={getImageUrl(producto.imagen)}
        alt={producto.nombre}
        className={styles.image}
        onError={(e) => { e.currentTarget.src = '/img/hero-products.png'; }}
      />
      <div className={styles.info}>
        <p className={styles.name}>{producto.nombre}</p>
        <p className={styles.price}>S/ {producto.precio.toFixed(2)}</p>
      </div>
      <div className={styles.qtyControls}>
        <button
          className={styles.qtyBtn}
          onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className={styles.qty}>{cantidad}</span>
        <button
          className={styles.qtyBtn}
          onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <p className={styles.subtotal}>
        S/ {(producto.precio * cantidad).toFixed(2)}
      </p>
      <button
        className={styles.removeBtn}
        onClick={() => removerDelCarrito(producto.id)}
        aria-label={`Eliminar ${producto.nombre}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  )
}

export default CartItemRow

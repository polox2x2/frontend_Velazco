import { useCart } from '../../contexts/CartContext'
import styles from './CartIcon.module.css'

interface CartIconProps {
  onClick: () => void
}

function CartIcon({ onClick }: CartIconProps) {
  const { cantidadTotal } = useCart()

  return (
    <button
      className={styles.cartBtn}
      onClick={onClick}
      aria-label={`Carrito con ${cantidadTotal} productos`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {cantidadTotal > 0 && (
        <span className={styles.badge}>{cantidadTotal}</span>
      )}
    </button>
  )
}

export default CartIcon

import { useState, useCallback, useEffect } from 'react'
import type { Producto } from '../../interfaces/Producto'
import { useCart } from '../../contexts/CartContext'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  producto: Producto
  simple?: boolean
}

function ProductCard({ producto, simple = false }: ProductCardProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const { agregarAlCarrito, addedProductId } = useCart()
  const isAdded = addedProductId === producto.id

  const cerrarConEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setModalAbierto(false)
  }, [])

  useEffect(() => {
    if (modalAbierto) {
      document.addEventListener('keydown', cerrarConEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', cerrarConEscape)
      document.body.style.overflow = ''
    }
  }, [modalAbierto, cerrarConEscape])

  return (
    <>
      <div className={styles.card}>
        <div
          className={`${styles.imageWrapper} ${!simple ? styles.clickable : ''}`}
          onClick={() => !simple && setModalAbierto(true)}
        >
          <img src={producto.imagen} alt={producto.nombre} onError={(e) => { e.currentTarget.src = '/img/hero-products.png'; }} />
        </div>
        <div className={`${styles.info} ${simple ? styles.infoSimple : ''}`}>
          <h3 className={styles.name}>{producto.nombre}</h3>
          {!simple && (
            <>
              <p className={styles.description}>{producto.descripcion}</p>
              <p className={styles.price}>S/ {producto.precio.toFixed(2)}</p>
              <button
                className={`${styles.addBtn} ${isAdded ? styles.added : ''}`}
                onClick={() => agregarAlCarrito(producto)}
              >
                {isAdded ? '✓ Agregado' : 'Agregar al carrito'}
              </button>
            </>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div
          className={styles.overlay}
          onClick={() => setModalAbierto(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setModalAbierto(false)}
              aria-label="Cerrar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <img
              src={producto.imagen}
              alt={producto.nombre}
              className={styles.modalImage}
            />

            <div className={styles.modalBody}>
              <h3 className={styles.modalName}>{producto.nombre}</h3>
              <p className={styles.modalPrice}>S/ {producto.precio.toFixed(2)}</p>
              <p className={styles.modalDesc}>{producto.descripcion}</p>

              <div className={styles.ingredientes}>
                <h4 className={styles.ingredientesTitle}>🥄 Ingredientes</h4>
                <p className={styles.ingredientesText}>{producto.ingredientes}</p>
              </div>

              <button
                className={`${styles.addBtn} ${isAdded ? styles.added : ''}`}
                onClick={() => agregarAlCarrito(producto)}
              >
                {isAdded ? '✓ Agregado' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductCard

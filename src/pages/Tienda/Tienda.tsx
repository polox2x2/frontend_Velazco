import { useState, useMemo } from 'react'
import ProductCard from '../../components/ProductCard/ProductCard'
import { useProducts } from '../../hooks/useProducts'
import styles from './Tienda.module.css'

function Tienda() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todos')
  const { productos, loading, error } = useProducts()

  // Extraer categorías únicas de los productos, incluyendo "Todos" al inicio
  const CATEGORIAS = useMemo(() => {
    const cats = new Set(productos.map(p => p.categoria));
    return ['Todos', ...Array.from(cats)];
  }, [productos]);

  const filtrados = useMemo(
    () =>
      categoriaActiva === 'Todos'
        ? productos
        : productos.filter((p) => p.categoria === categoriaActiva),
    [categoriaActiva, productos]
  )

  if (loading) return <section className={styles.page}><h2 className={styles.title}>Cargando catálogo...</h2></section>
  if (error) return <section className={styles.page}><h2 className={styles.title}>Error cargando tienda: {error}</h2></section>

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>TIENDA</h2>
      <p className={styles.subtitle}>
        Explora todos nuestros productos tradicionales
      </p>

      <div className={styles.tabs}>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${categoriaActiva === cat ? styles.tabActive : ''}`}
            onClick={() => setCategoriaActiva(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtrados.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  )
}

export default Tienda

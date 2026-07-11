import { useEffect, useMemo } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import ProductCard from '../../components/ProductCard/ProductCard'
import { useProducts } from '../../hooks/useProducts'
import type { MainContext } from '../../layouts/MainLayout/MainLayout'
import { Producto } from '../../interfaces/Producto'
import styles from './Home.module.css'

function Home() {
  const location = useLocation()
  useOutletContext<MainContext>()
  const { productos } = useProducts()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location])

  const randomTres = useMemo(() => {
    if (!productos || productos.length === 0) return [];
    // Shuffle the products randomly
    const shuffled = [...productos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [productos]);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Bienvenidos a Dulcería y Pastelería Velazco</h1>
          <p>
            Más de 80 años endulzando la vida de las familias iqueñas con recetas
            tradicionales, elaboradas artesanalmente y con insumos de la más alta
            calidad. ¡Descubre el auténtico sabor de la tradición!
          </p>
          <a href="#historia" className={styles.btnCta}>
            Explora Nuestra historia
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
        <div className={styles.heroImageContainer}>
          <img
            src="/img/hero-products.png"
            alt="Nuestros Productos"
            className={styles.heroImage}
          />
        </div>
      </section>

      <section className={styles.historySection} id="historia">
        <h2>NUESTRA HISTORIA</h2>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutImageContainer}>
            <img
              src="/img/sobre-nosotros.png"
              alt="El Secreto de lo Natural"
              className={styles.aboutImage}
            />
          </div>
          <div className={styles.aboutText}>
            <h3>SOBRE NOSOTROS</h3>
            <p>
              Desde 1936, Dulcería y Pastelería Velazco ha mantenido viva la
              tradición repostera de Ica, transmitiendo de generación en
              generación las recetas más emblemáticas de la región. Nuestro
              compromiso ha sido siempre conservar el sabor auténtico y la
              excelencia que nos caracteriza.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.productsSection} id="productos">
        <div className={styles.productsBanner}>
          <h2>NUESTROS PRODUCTOS DESTACADOS</h2>
        </div>
        <div className={styles.productGrid}>
          {randomTres.map((producto: Producto, index: number) => (
            <div key={producto.id} className={styles.animatedCard} style={{ animationDelay: `${index * 0.2}s` }}>
              <ProductCard producto={producto} simple />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home

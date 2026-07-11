import { testimonios } from '../../constants/testimonios'
import styles from './Testimonios.module.css'

function Testimonios() {
  return (
    <section className={styles.page}>
      <h2 className={styles.title}>TESTIMONIOS</h2>
      <p className={styles.subtitle}>Lo que dicen nuestros clientes</p>

      <div className={styles.grid}>
        {testimonios.map((t) => (
          <article key={t.id} className={styles.card}>
            <div className={styles.stars}>
              {Array.from({ length: t.calificacion }, (_, i) => (
                <svg
                  key={i}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#e8a838"
                  stroke="#e8a838"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p className={styles.text}>"{t.texto}"</p>
            <p className={styles.author}>— {t.nombre}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Testimonios

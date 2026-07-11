import { useState, type FormEvent } from 'react'
import { enviarFormulario, type FormularioContacto } from '../../services/contactoApi'
import styles from './Contacto.module.css'
import Swal from 'sweetalert2'

interface FormErrors {
  nombre?: string
  apellido?: string
  email?: string
  asunto?: string
  mensaje?: string
}

function validate(data: FormularioContacto): FormErrors {
  const errors: FormErrors = {}
  if (!data.nombre.trim()) errors.nombre = 'El nombre es obligatorio'
  if (!data.apellido.trim()) errors.apellido = 'El apellido es obligatorio'
  if (!data.email.trim()) errors.email = 'El email es obligatorio'
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email no válido'
  if (!data.asunto.trim()) errors.asunto = 'El asunto es obligatorio'
  if (!data.mensaje.trim()) errors.mensaje = 'El mensaje es obligatorio'
  return errors
}

function Contacto() {
  const [form, setForm] = useState<FormularioContacto>({
    nombre: '',
    apellido: '',
    email: '',
    asunto: '',
    mensaje: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleChange = (field: keyof FormularioContacto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validation = validate(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setEnviando(true)
    try {
      await enviarFormulario(form)
      setEnviado(true)
      setForm({ nombre: '', apellido: '', email: '', asunto: '', mensaje: '' })
    } catch {
      Swal.fire('Error', 'Error al enviar el mensaje. Intenta nuevamente.', 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>CONTACTO</h2>
      <p className={styles.subtitle}>
        Estamos aquí para ayudarte. Contáctanos para cualquier consulta o
        emergencia.
      </p>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="nombre" className={styles.label}>
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
              {errors.nombre && (
                <span className={styles.error}>{errors.nombre}</span>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="apellido" className={styles.label}>
                Apellido
              </label>
              <input
                id="apellido"
                type="text"
                className={`${styles.input} ${errors.apellido ? styles.inputError : ''}`}
                value={form.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
              />
              {errors.apellido && (
                <span className={styles.error}>{errors.apellido}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="asunto" className={styles.label}>
              Asunto
            </label>
            <input
              id="asunto"
              type="text"
              className={`${styles.input} ${errors.asunto ? styles.inputError : ''}`}
              value={form.asunto}
              onChange={(e) => handleChange('asunto', e.target.value)}
            />
            {errors.asunto && (
              <span className={styles.error}>{errors.asunto}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="mensaje" className={styles.label}>
              Mensaje
            </label>
            <textarea
              id="mensaje"
              className={`${styles.textarea} ${errors.mensaje ? styles.inputError : ''}`}
              rows={5}
              value={form.mensaje}
              onChange={(e) => handleChange('mensaje', e.target.value)}
            />
            {errors.mensaje && (
              <span className={styles.error}>{errors.mensaje}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : enviado ? '✓ Mensaje enviado' : 'Enviar mensaje'}
          </button>
        </form>

        <aside className={styles.info}>
          <h3 className={styles.infoTitle}>CONTACTO</h3>

          <div className={styles.infoCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8a838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <p className={styles.infoLabel}>Dirección</p>
              <p className={styles.infoValue}>
                Av. Grau N° 195-199, Cercado – Ica
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8a838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <div>
              <p className={styles.infoLabel}>Email</p>
              <p className={styles.infoValue}>
                velazco@dulceriapasteleriavelazco.com
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8a838" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className={styles.infoLabel}>Horario</p>
              <p className={styles.infoValue}>
                Lunes a Domingo: 9:00 AM - 21:00 PM
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Contacto

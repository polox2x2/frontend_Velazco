import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { paymentRegistry } from '../../services/payment'
import DeliveryMap from '../../components/DeliveryMap/DeliveryMap'
import { publicApi } from '../../services/api'
import styles from './Checkout.module.css'

interface MetodoPago {
  id: string
  nombre: string
  icono: JSX.Element
}

const metodosPago: MetodoPago[] = [
  {
    id: 'mercadopago',
    nombre: 'Mercado Pago',
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 'efectivo',
    nombre: 'Pago en Efectivo (Contra Entrega)',
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
]

function Checkout() {
  const navigate = useNavigate()
  const { status } = useParams()
  const { items, total, limpiarCarrito } = useCart()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (items.length === 0) navigate('/')
  }, [items, navigate])

  const [email, setEmail] = useState(user?.email || '')
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombreCompleto || '')
  const [telefono, setTelefono] = useState(user?.telefono || '')
  const [modoEntrega, setModoEntrega] = useState<'delivery' | 'paraLlevar'>('paraLlevar')
  const [direccion] = useState('Av. Grau N° 195-199, Cercado – Ica')
  const [direccionCliente, setDireccionCliente] = useState('')
  const [metodoPago, setMetodoPago] = useState<string | null>(null)
  const [montoEfectivo, setMontoEfectivo] = useState('')
  const [codigoDescuento, setCodigoDescuento] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [mensajeDescuento, setMensajeDescuento] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)

  const metodosDisponibles = useMemo(
    () =>
      modoEntrega === 'delivery'
        ? metodosPago
        : metodosPago.filter((m) => m.id === 'mercadopago'),
    [modoEntrega],
  )

  useEffect(() => {
    if (metodoPago && !metodosDisponibles.some((m) => m.id === metodoPago)) {
      setMetodoPago(null)
    }
  }, [modoEntrega])

  const [enviando, setEnviando] = useState(false)
  const [pagado, setPagado] = useState(false)

  useEffect(() => {
    if (status === 'success' || status === 'pending') {
      const paymentId = searchParams.get('payment_id');
      const orderIdStr = searchParams.get('external_reference');
      if (paymentId && orderIdStr) {
        const orderId = parseInt(orderIdStr, 10);
        publicApi.validatePayment(orderId, paymentId)
          .then(() => {
            // Payment validated successfully
          })
          .catch(err => {
            console.error('Error validating payment', err);
          })
          .finally(() => {
            limpiarCarrito();
          });
      } else {
        limpiarCarrito()
      }
    }
  }, [status, searchParams, limpiarCarrito])

  if (items.length === 0 && !status) return null

  const handlePagar = async () => {
    setErrorMsg('')
    if (!metodoPago) {
      setErrorMsg('Selecciona un método de pago')
      return
    }
    setEnviando(true)
    try {
      let clientName = nombreCompleto.trim() || email.split('@')[0] || 'Cliente Web';
        
      if (metodoPago === 'efectivo') {
        const amount = parseFloat(montoEfectivo);
        if (isNaN(amount) || amount < total) {
          setErrorMsg(`El monto debe ser mayor o igual al total (S/ ${total.toFixed(2)}).`);
          setEnviando(false);
          return;
        }
        const change = (amount - total).toFixed(2);
        clientName += ` (Efectivo S/ ${amount.toFixed(2)} - Vuelto S/ ${change})`;
      }

      const orderData = {
        clientName: clientName,
        clientEmail: email.trim() || undefined,
        details: items.map(item => ({
          productId: item.producto.id,
          quantity: item.cantidad
        }))
      };
      
      const orderResponse = await publicApi.createOrder(orderData);

      if (metodoPago === 'mercadopago') {
        const gateways = paymentRegistry.obtenerDisponibles()
        if (gateways.length > 0) {
          const resultado = await gateways[0].procesarPago(total, 'PEN', items, orderResponse.id)
          if (resultado.exito && resultado.urlRedireccion) {
            window.location.href = resultado.urlRedireccion;
            return; // Stop execution, user is redirecting
          }
        }
      }
      setPagado(true)
      limpiarCarrito()
    } catch (err: any) {
      console.error(err);
      const backendMsg = err.response?.data?.message;
      setErrorMsg(backendMsg || 'Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setEnviando(false)
    }
  }

  const aplicarDescuento = () => {
    if (!codigoDescuento.trim()) {
      setMensajeDescuento({ tipo: 'error', texto: 'Ingresa un código de descuento' })
      return
    }
    setMensajeDescuento({ tipo: 'exito', texto: 'Código aplicado correctamente' })
  }

  if (pagado || status === 'success' || status === 'pending') {
    return (
      <section className={styles.page}>
        <div className={styles.success}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2>{status === 'pending' ? '¡Tu pago está pendiente!' : '¡Pedido confirmado!'}</h2>
          <p>{status === 'pending' ? 'Te avisaremos cuando el pago se acredite.' : 'Gracias por tu compra. Te enviaremos la confirmación a tu correo.'}</p>
          <Link to="/" className={styles.backBtn}>Volver a la tienda</Link>
        </div>
      </section>
    )
  }

  if (status === 'failure') {
    return (
      <section className={styles.page}>
        <div className={styles.success} style={{ color: '#e74c3c' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h2>Hubo un problema con tu pago</h2>
          <p>No se pudo procesar tu compra a través de Mercado Pago.</p>
          <Link to="/checkout" className={styles.backBtn} style={{ background: '#e74c3c' }}>Volver a intentar</Link>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Checkout</h2>

      <div className={styles.grid}>
        <div className={styles.left}>
          <h3 className={styles.sectionTitle}>Resumen del pedido</h3>

          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.producto.id} className={styles.itemRow}>
                <img src={item.producto.imagen} alt={item.producto.nombre} className={styles.itemImg} onError={(e) => { e.currentTarget.src = '/img/hero-products.png'; }} />
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.producto.nombre}</p>
                  <p className={styles.itemQty}>x{item.cantidad}</p>
                </div>
                <p className={styles.itemTotal}>S/ {(item.producto.precio * item.cantidad).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className={styles.discountRow}>
            <input
              type="text"
              className={styles.discountInput}
              placeholder="Código de descuento"
              value={codigoDescuento}
              onChange={(e) => {
                setCodigoDescuento(e.target.value)
                setMensajeDescuento(null)
              }}
            />
            <button className={styles.discountBtn} onClick={aplicarDescuento}>Aplicar</button>
          </div>
          {mensajeDescuento && (
            <p className={mensajeDescuento.tipo === 'exito' ? styles.discountSuccess : styles.discountError}>
              {mensajeDescuento.texto}
            </p>
          )}

          <div className={styles.totals}>
            <div className={styles.totalLine}>
              <span>Subtotal</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
            <div className={styles.totalLine}>
              <span>Envío</span>
              <span>{modoEntrega === 'delivery' ? 'S/ 0.00' : '—'}</span>
            </div>
            <div className={`${styles.totalLine} ${styles.totalFinal}`}>
              <span>Total</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          {/* Section 1 - Contact & Delivery */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contacto y entrega</h3>

            <div className={styles.contactBlock}>
              <div className={styles.field} style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Nombre completo"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                />
              </div>
              <div className={styles.contactCol}>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.toggleRow}>
              <button
                className={`${styles.toggleBtn} ${modoEntrega === 'delivery' ? styles.toggleActive : ''}`}
                onClick={() => setModoEntrega('delivery')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Delivery
              </button>
              <button
                className={`${styles.toggleBtn} ${modoEntrega === 'paraLlevar' ? styles.toggleActive : ''}`}
                onClick={() => setModoEntrega('paraLlevar')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Para llevar
              </button>
              <span className={styles.timeTag}>~50 min</span>
            </div>

            {modoEntrega === 'delivery' && (
              <>
                <div className={styles.refAddress}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className={styles.refAddressText}>{direccion}</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Tu dirección de entrega</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Escribe tu dirección o haz clic en el mapa"
                    value={direccionCliente}
                    onChange={(e) => setDireccionCliente(e.target.value)}
                  />
                </div>

                <DeliveryMap
                  onAddressChange={(addr) => setDireccionCliente(addr)}
                />
              </>
            )}
          </div>

          {/* Section 2 - Payment Method */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Medio de pago</h3>

            <div className={styles.radioGroup}>
              {metodosDisponibles.map((mp) => (
                <label
                  key={mp.id}
                  className={`${styles.radioCard} ${metodoPago === mp.id ? styles.radioActive : ''}`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value={mp.id}
                    checked={metodoPago === mp.id}
                    onChange={() => setMetodoPago(mp.id)}
                    className={styles.radioInput}
                  />
                  {mp.icono}
                  <span>{mp.nombre}</span>
                </label>
              ))}
            </div>

            {metodoPago === 'efectivo' && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e1e1e1' }}>
                <label className={styles.label} style={{ marginBottom: '8px', display: 'block' }}>¿Con cuánto vas a pagar?</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' }}>S/</span>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder={`Mínimo ${total.toFixed(2)}`}
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value)}
                    min={total}
                    step="0.50"
                  />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '8px', margin: '8px 0 0 0' }}>
                  Te llevaremos el vuelto exacto.
                </p>
              </div>
            )}
          </div>

          {/* Section 3 - Payment Confirmation */}
          <div className={styles.section}>
            {errorMsg && (
              <div className={styles.errorBanner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {errorMsg}
              </div>
            )}

            {metodoPago && (
              <div className={styles.paymentConfirm}>
                Pagando con{' '}
                <strong>{metodosDisponibles.find((m) => m.id === metodoPago)?.nombre}</strong>
              </div>
            )}

            <button
              className={styles.payBtn}
              onClick={handlePagar}
              disabled={enviando || !metodoPago}
            >
              {enviando
                ? 'Procesando...'
                : `Pagar ahora — S/ ${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Checkout

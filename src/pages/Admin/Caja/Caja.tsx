import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, User } from 'lucide-react';
import { adminApi } from '../../../services/api';
import { getImageUrl } from '../../../utils/image';
import styles from './Caja.module.css';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin', 'Otros'];

export default function Caja() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientName, setClientName] = useState('Cliente General');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAvailableProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching available products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Solo quedan ${product.stock} unidades de ${product.name}`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) return item;
        if (newQuantity > item.stock) {
          Swal.fire({
            icon: 'warning',
            title: 'Stock máximo',
            text: `Stock máximo alcanzado para ${item.name}`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!clientName.trim()) {
      Swal.fire('Atención', 'Por favor ingresa un nombre de cliente.', 'warning');
      return;
    }

    // Pedir DNI (opcional)
    const { value: dniValue, isDismissed: isDniDismissed } = await Swal.fire({
      title: 'Datos del Cliente',
      input: 'text',
      inputLabel: 'DNI / RUC (Opcional)',
      inputPlaceholder: 'Ingrese número de documento o deje en blanco',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar'
    });

    if (isDniDismissed) return; // Si cancela el prompt de DNI
    
    let changeAmount = 0;
    
    // Simular flujo según método de pago
    if (paymentMethod === 'Efectivo') {
      const { value: cashAmountStr, isConfirmed } = await Swal.fire({
        title: 'Pago en Efectivo',
        input: 'number',
        inputLabel: `Total a cobrar: S/. ${total.toFixed(2)}`,
        inputPlaceholder: 'Ingrese el monto recibido',
        showCancelButton: true,
        confirmButtonText: 'Cobrar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) return 'Debes ingresar un monto';
          if (parseFloat(value) < total) return 'El monto es menor al total';
          return null;
        }
      });
      
      if (!isConfirmed || !cashAmountStr) return; // El usuario canceló
      
      changeAmount = parseFloat(cashAmountStr) - total;
    } else {
      // Simular pago con tarjeta, yape, etc
      await Swal.fire({
        title: `Procesando pago con ${paymentMethod}...`,
        text: 'Por favor espere (simulación de POS/QR)',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    }

    try {
      setIsSubmitting(true);
      
      // Step 1: Start Order
      const details = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      const orderResponse = await adminApi.startOrder({
        clientName: clientName.trim(),
        details
      });

      // Step 2: Confirm Sale (Pago)
      await adminApi.confirmSale(orderResponse.id, paymentMethod);

      // Step 3: Confirm Dispatch (Entrega inmediata en tienda física)
      await adminApi.confirmDispatch(orderResponse.id);

      // Generar Recibo HTML
      const currentDate = new Date().toLocaleString('es-PE');
      const ticketHtml = `
        <div style="text-align: left; font-family: monospace; font-size: 14px; padding: 10px; background: #fff; border: 1px dashed #ccc; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 10px;">
            <strong>PANADERÍA VELAZCO</strong><br>
            RUC: 20123456789<br>
            Boleta de Venta Electrónica<br>
            <small>${currentDate}</small>
          </div>
          <hr style="border-top: 1px dashed #000;"/>
          <div>
            <strong>Cliente:</strong> ${clientName.trim()}<br>
            <strong>DNI:</strong> ${dniValue || 'No especificado'}<br>
            <strong>Método:</strong> ${paymentMethod}
          </div>
          <hr style="border-top: 1px dashed #000;"/>
          <table style="width: 100%; font-size: 14px;">
            <thead>
              <tr style="text-align: left;">
                <th>Cant</th>
                <th>Producto</th>
                <th style="text-align: right;">Subt</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.quantity}</td>
                  <td>${item.name}</td>
                  <td style="text-align: right;">S/. ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr style="border-top: 1px dashed #000;"/>
          <div style="text-align: right;">
            <strong>TOTAL: S/. ${total.toFixed(2)}</strong>
          </div>
          ${paymentMethod === 'Efectivo' ? `<div style="text-align: right; margin-top: 5px; color: #155724;"><strong>Vuelto: S/. ${changeAmount.toFixed(2)}</strong></div>` : ''}
          <div style="text-align: center; margin-top: 20px; font-size: 12px;">
            ¡Gracias por su preferencia!
          </div>
        </div>
      `;

      Swal.fire({
        title: '¡Venta completada!',
        html: ticketHtml,
        confirmButtonText: 'Cerrar e Imprimir',
        confirmButtonColor: '#ff5a5f',
        width: 400
      }).then(() => {
        // Here you could trigger window.print() if it was a dedicated print view
      });
      
      // Clean up
      setCart([]);
      setClientName('Cliente General');
      await fetchProducts(); // Refresh stock
    } catch (error) {
      console.error("Error processing checkout", error);
      Swal.fire('Error', 'Ocurrió un error al procesar la venta.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* CATALOG SECTION */}
      <div className={styles.catalog}>
        <div className={styles.header}>
          <h1 className={styles.title}>Caja / POS</h1>
        </div>
        
        <input 
          type="text" 
          placeholder="Buscar producto por nombre..." 
          className={styles.searchInput} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className={styles.productsGrid}>
          {loading ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>No se encontraron productos disponibles.</div>
          ) : (
            filteredProducts.map(prod => (
              <div 
                key={prod.id} 
                className={`${styles.productCard} ${prod.stock <= 0 ? styles.productCardEmpty : ''}`}
                onClick={() => addToCart(prod)}
              >
                <div 
                  className={styles.productImage}
                  style={{ backgroundImage: `url('${getImageUrl(prod.image)}')` }}
                >
                  {prod.stock <= 5 && prod.stock > 0 && <span className={styles.stockBadgeWarning}>{prod.stock} left</span>}
                  {prod.stock <= 0 && <span className={styles.stockBadgeEmpty}>Agotado</span>}
                </div>
                <div className={styles.productName}>{prod.name}</div>
                <div className={styles.productPrice}>S/. {prod.price.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TICKET SECTION */}
      <div className={styles.ticket}>
        <div className={styles.ticketHeader}>
          <ShoppingCart size={20} />
          <span>Ticket Actual</span>
        </div>
        
        <div className={styles.ticketClient}>
          <div className={styles.clientInputGroup}>
            <User size={16} color="#666" />
            <input 
              type="text" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nombre del Cliente"
              className={styles.clientInput}
            />
          </div>
        </div>

        <div className={styles.ticketBody}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <ShoppingCart size={40} color="#ddd" />
              <p>El ticket está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemName}>{item.name}</div>
                  <div className={styles.cartItemPrice}>S/. {(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className={styles.cartItemControls}>
                  <button onClick={() => updateQuantity(item.id, -1)} className={styles.qtyBtn}><Minus size={14}/></button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className={styles.qtyBtn}><Plus size={14}/></button>
                  <button onClick={() => removeFromCart(item.id)} className={styles.delBtn}><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.ticketFooter}>
          <div className={styles.paymentSection}>
            <label><CreditCard size={16}/> Método de Pago:</label>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={styles.paymentSelect}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.totalRow}>
            <span>Total:</span>
            <span>S/. {total.toFixed(2)}</span>
          </div>
          <button 
            className={styles.btnPay} 
            disabled={cart.length === 0 || isSubmitting}
            onClick={handleCheckout}
          >
            {isSubmitting ? 'Procesando...' : 'Cobrar S/. ' + total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

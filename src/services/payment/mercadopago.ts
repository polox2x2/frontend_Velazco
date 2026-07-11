import type {
  PaymentGateway,
  PaymentResult,
} from '../../interfaces/PaymentGateway'
import type { CartItem } from '../../interfaces/CartItem'

export const mercadopagoGateway: PaymentGateway = {
  id: 'mercadopago',
  nombre: 'Mercado Pago',
  icono: '/img/mercadopago-logo.png',
  estaDisponible: () => true,
  procesarPago: async (
    _monto: number,
    _moneda: string,
    _items: CartItem[],
    orderId?: number
  ): Promise<PaymentResult> => {
    
    if (!orderId) {
      return {
        exito: false,
        error: 'No se generó el número de orden.'
      }
    }

    try {
      const { publicApi } = await import('../api');
      const preference = await publicApi.createPaymentPreference(orderId);
      
      return {
        exito: true,
        transaccionId: preference.preferenceId,
        urlRedireccion: preference.initPoint,
      }
    } catch (error) {
      console.error('[Mercado Pago] Error creating preference:', error);
      return {
        exito: false,
        error: 'No se pudo generar la preferencia de pago de Mercado Pago.'
      }
    }
  },
}

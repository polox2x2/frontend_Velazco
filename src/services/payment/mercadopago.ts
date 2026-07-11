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
    monto: number,
    moneda: string,
    items: CartItem[],
    orderId?: number
  ): Promise<PaymentResult> => {
    console.log('[Mercado Pago] Iniciando pago:', { monto, moneda, items, orderId })
    
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

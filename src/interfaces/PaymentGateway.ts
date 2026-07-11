import type { CartItem } from './CartItem'

export interface PaymentResult {
  exito: boolean
  transaccionId?: string
  error?: string
  urlRedireccion?: string
}

export interface PaymentGateway {
  id: string
  nombre: string
  icono: string
  estaDisponible(): boolean
  procesarPago(
    monto: number,
    moneda: string,
    items: CartItem[],
    orderId?: number
  ): Promise<PaymentResult>
}

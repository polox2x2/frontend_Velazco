import { paymentRegistry } from './PaymentRegistry'
import { mercadopagoGateway } from './mercadopago'

paymentRegistry.registrar(mercadopagoGateway)

export { paymentRegistry }
export type { PaymentGateway, PaymentResult } from '../../interfaces/PaymentGateway'

import type { PaymentGateway } from '../../interfaces/PaymentGateway'

class PaymentRegistry {
  private gateways: Map<string, PaymentGateway> = new Map()

  registrar(gateway: PaymentGateway): void {
    this.gateways.set(gateway.id, gateway)
  }

  remover(id: string): void {
    this.gateways.delete(id)
  }

  obtener(id: string): PaymentGateway | undefined {
    return this.gateways.get(id)
  }

  obtenerDisponibles(): PaymentGateway[] {
    return Array.from(this.gateways.values()).filter((g) =>
      g.estaDisponible()
    )
  }

  limpiar(): void {
    this.gateways.clear()
  }
}

export const paymentRegistry = new PaymentRegistry()

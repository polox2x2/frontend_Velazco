import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { CartItem } from '../interfaces/CartItem'
import type { Producto } from '../interfaces/Producto'

type CartAction =
  | { type: 'ADD_ITEM'; payload: Producto }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QTY'; payload: { id: number; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADDED_FEEDBACK'; payload: number | null }

interface CartState {
  items: CartItem[]
  addedProductId: number | null
}

interface CartContextType extends CartState {
  agregarAlCarrito: (producto: Producto) => void
  removerDelCarrito: (id: number) => void
  actualizarCantidad: (id: number, cantidad: number) => void
  limpiarCarrito: () => void
  total: number
  cantidadTotal: number
}

const STORAGE_KEY = 'velazco-cart'

function leerCarritoStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CartItem[]
  } catch { /* ignore */ }
  return []
}

function guardarCarritoStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* ignore */ }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const index = state.items.findIndex(
        (i) => i.producto.id === action.payload.id
      )
      if (index >= 0) {
        const items = state.items.map((item) =>
          item.producto.id === action.payload.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
        return { ...state, items, addedProductId: action.payload.id }
      }
      return {
        ...state,
        items: [...state.items, { producto: action.payload, cantidad: 1 }],
        addedProductId: action.payload.id,
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.producto.id !== action.payload),
      }
    case 'UPDATE_QTY': {
      if (action.payload.cantidad <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => i.producto.id !== action.payload.id
          ),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.producto.id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        ),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'ADDED_FEEDBACK':
      return { ...state, addedProductId: action.payload }
    default:
      return state
  }
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: leerCarritoStorage(),
    addedProductId: null,
  })

  useEffect(() => {
    guardarCarritoStorage(state.items)
  }, [state.items])

  useEffect(() => {
    if (state.addedProductId !== null) {
      const timer = setTimeout(() => {
        dispatch({ type: 'ADDED_FEEDBACK', payload: null })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.addedProductId])

  const agregarAlCarrito = useCallback((producto: Producto) => {
    dispatch({ type: 'ADD_ITEM', payload: producto })
  }, [])

  const removerDelCarrito = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const actualizarCantidad = useCallback((id: number, cantidad: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, cantidad } })
  }, [])

  const limpiarCarrito = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const total = state.items.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  )

  const cantidadTotal = state.items.reduce(
    (sum, item) => sum + item.cantidad,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addedProductId: state.addedProductId,
        agregarAlCarrito,
        removerDelCarrito,
        actualizarCantidad,
        limpiarCarrito,
        total,
        cantidadTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}

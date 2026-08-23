import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'shoonya_cart_v1'
export const FREE_SHIPPING_THRESHOLD = 999
export const SHIPPING_FEE = 49

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })
  const [isOpen, setOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!toastMsg) return undefined
    const t = setTimeout(() => setToastMsg(null), 2400)
    return () => clearTimeout(t)
  }, [toastMsg])

  const add = useCallback((product, variant, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.variantId === variant.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + qty) }
        return next
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          slug: product.slug,
          name: product.name,
          icon: product.icon,
          theme: product.theme,
          label: variant.label,
          price: variant.price,
          mrp: variant.mrp,
          qty,
        },
      ]
    })
    setToastMsg(`Added ${product.name} · ${variant.label}`)
  }, [])

  const setQty = useCallback((variantId, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) =>
            i.variantId === variantId ? { ...i, qty: Math.min(99, qty) } : i,
          ),
    )
  }, [])

  const remove = useCallback((variantId) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const toast = useCallback((msg) => setToastMsg(msg), [])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      add,
      remove,
      setQty,
      clear,
      toast,
      toastMsg,
    }),
    [items, count, subtotal, isOpen, add, remove, setQty, clear, toast, toastMsg],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

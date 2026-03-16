import { create } from "zustand"
import { get, post, put, del } from "../api/client"

export const useCartStore = create((set) => ({
  cart: [],

  fetchCart: async () => {
    try {
      const res = await get("/cart")
      set({ cart: res?.items || [] })
    } catch {}
  },

  addToCart: async (item) => {
    try {
      const res = await post("/cart/add", {
        productId: item.id,
        quantity: item.quantity,
        size: item.size,
      })
      set({ cart: res.cart?.items || [] })
    } catch {}
  },

  removeFromCart: async (productId, size) => {
    const state = useCartStore.getState()
    const cartItem = state.cart.find(
      (c) => c.product?._id === productId && c.size === size
    )
    if (!cartItem) return
    try {
      const res = await del(`/cart/item/${cartItem._id}`)
      set({ cart: res.cart?.items || [] })
    } catch {}
  },

  updateQuantity: async (productId, size, quantity) => {
    const state = useCartStore.getState()
    const cartItem = state.cart.find(
      (c) => c.product?._id === productId && c.size === size
    )
    if (!cartItem) return
    try {
      const res = await put(`/cart/item/${cartItem._id}`, { quantity })
      set({ cart: res.cart?.items || [] })
    } catch {}
  },

  clearCart: async () => {
    try {
      await del("/cart")
    } catch {}
    set({ cart: [] })
  },

  setCart: (cart) => set({ cart }),
}))

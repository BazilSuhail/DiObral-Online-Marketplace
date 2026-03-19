import { create } from "zustand"
import { get, post, put, del } from "../api/client"

const findCartItem = (state, productId, size) =>
  state.cart.find(
    (c) => c._id === productId || (c.product?._id === productId && c.size === size)
  )

const itemStockCap = (c) => {
  if (c.itemType === "bundle") return c.bundle && c.bundle.stock > 0 ? c.bundle.stock : 99
  return c.product?.stock || 99
}

export const useCartStore = create((set, getState) => ({
  cart: [],
  pendingRemovals: [],

  fetchCart: async () => {
    try {
      const res = await get("/cart")
      set({ cart: res?.items || res?.cart?.items || [], pendingRemovals: [] })
    } catch {}
  },

  addToCart: async (item) => {
    try {
      if (item.bundleId) {
        await post("/cart/add", {
          bundleId: item.bundleId,
          quantity: item.quantity,
        })
      } else {
        await post("/cart/add", {
          productId: item.id || item.productId,
          quantity: item.quantity,
          size: item.size,
        })
      }
      await getState().fetchCart()
    } catch {}
  },

  removeFromCart: (productId, size) => {
    const state = getState()
    const cartItem = findCartItem(state, productId, size)
    if (!cartItem) return
    set({
      cart: state.cart.filter((c) => c._id !== cartItem._id),
      pendingRemovals: [...state.pendingRemovals, cartItem._id],
    })
  },

  updateQuantity: (productId, size, quantity) => {
    const state = getState()
    set({
      cart: state.cart.map((c) =>
        c._id === productId || (c.product?._id === productId && c.size === size)
          ? { ...c, quantity: Math.max(1, Math.min(quantity, itemStockCap(c))) }
          : c
      ),
    })
  },

  incrementQuantity: (productId, size) => {
    const state = getState()
    set({
      cart: state.cart.map((c) =>
        c._id === productId || (c.product?._id === productId && c.size === size)
          ? { ...c, quantity: Math.min((c.quantity || 0) + 1, itemStockCap(c)) }
          : c
      ),
    })
  },

  decrementQuantity: (productId, size) => {
    const state = getState()
    set({
      cart: state.cart.map((c) =>
        c._id === productId || (c.product?._id === productId && c.size === size)
          ? { ...c, quantity: Math.max((c.quantity || 0) - 1, 1) }
          : c
      ),
    })
  },

  saveCart: async () => {
    const state = getState()
    const errors = []
    for (const id of state.pendingRemovals) {
      try { await del(`/cart/item/${id}`) } catch { errors.push(`Failed to remove item`) }
    }
    for (const item of state.cart) {
      try { await put(`/cart/item/${item._id}`, { quantity: item.quantity }) } catch (e) {
        const msg = e.response?.data?.message || `Failed to update ${item.product?.name || "item"}`
        errors.push(msg)
      }
    }
    if (errors.length) throw new Error(errors.join(". "))
    await getState().fetchCart()
  },

  clearCart: async () => {
    try {
      await del("/cart")
    } catch {}
    set({ cart: [], pendingRemovals: [] })
  },

  setCart: (cart) => set({ cart }),
}))

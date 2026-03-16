import { create } from "zustand"
import { get, post } from "../api/client"

const BASE = "/wishlist"

export const useWishlistStore = create((set) => ({
  wishlistMap: {},

  toggleWishlist: async (productId) => {
    try {
      const res = await post(`${BASE}/products/${productId}`)
      const wishlisted = res.wishlisted
      set((s) => {
        const map = { ...s.wishlistMap }
        if (wishlisted) map[productId] = true
        else delete map[productId]
        return { wishlistMap: map }
      })
      return wishlisted
    } catch (e) {
      console.error("toggleWishlist failed", e)
      return null
    }
  },

  checkWishlist: async (productId) => {
    try {
      const res = await get(`${BASE}/products/check/${productId}`)
      set((s) => ({
        wishlistMap: { ...s.wishlistMap, [productId]: res.wishlisted },
      }))
      return res.wishlisted
    } catch (e) {
      console.error("checkWishlist failed", e)
      return false
    }
  },

  checkBatch: async (ids) => {
    if (!ids.length) return
    try {
      const res = await get(`${BASE}/products/check`, { ids: ids.join(",") })
      set((s) => ({ wishlistMap: { ...s.wishlistMap, ...res } }))
    } catch (e) {
      console.error("checkBatch failed", e)
    }
  },

  toggleFollowStore: async (storeId) => {
    try {
      const res = await post(`${BASE}/stores/${storeId}`)
      return res.following
    } catch (e) {
      console.error("toggleFollowStore failed", e)
      return null
    }
  },
}))

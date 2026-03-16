import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMarketplaceStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (c) => c.id === item.id && c.size === item.size
          );
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.id === item.id && c.size === item.size
                  ? { ...c, quantity: c.quantity + item.quantity }
                  : c
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (id, size) =>
        set((state) => ({
          cart: state.cart.filter((c) => !(c.id === id && c.size === size)),
        })),

      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.id === id && c.size === size ? { ...c, quantity } : c
          ),
        })),

      clearCart: () => set({ cart: [] }),

      setCart: (cart) => set({ cart }),
    }),
    {
      name: "diobral-marketplace-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
      }),
    }
  )
);

export function parseJwt(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

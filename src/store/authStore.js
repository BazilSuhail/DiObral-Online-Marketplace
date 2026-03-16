import { create } from "zustand"
import { persist } from "zustand/middleware"
import { post, put, apiCall, get } from "../api/client"

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      logout: () => {
        localStorage.removeItem("token")
        set({ token: null, user: null, isAuthenticated: false })
      },

      setUser: (user) => set({ user }),

      fetchProfile: async () => {
        try {
          const res = await get("/auth/profile")
          set({ user: res })
          return res
        } catch {}
      },

      updateProfile: async (data) => {
        const res = await put("/auth/profile", data)
        set({ user: res.profile })
        return res
      },
    }),
    {
      name: "diobral-auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export function parseJwt(token) {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}
